import { User, LootItem, ShippingAddress, Shipment } from '../types';
import { supabase } from './supabaseClient';

export const validateAddress = (address: ShippingAddress): boolean => {
    return (
        address.fullName.length > 0 &&
        address.streetAddress.length > 0 &&
        address.city.length > 0 &&
        address.state.length > 0 &&
        address.zipCode.length > 0 &&
        address.country.length > 0
    );
};

export const createShipment = async (userId: string, items: LootItem[], address: ShippingAddress): Promise<Shipment> => {
    if (!validateAddress(address)) {
        throw new Error("Invalid shipping address");
    }

    const newShipment: Shipment = {
        id: `ship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        items: items,
        address: address,
        status: 'PENDING',
        createdAt: Date.now(),
    };

    // Insert shipment into database
    const { error: shipmentError } = await supabase
        .from('shipments')
        .insert({
            id: newShipment.id,
            user_id: userId,
            items: newShipment.items,
            address: newShipment.address,
            status: newShipment.status,
            created_at: newShipment.createdAt,
        });

    if (shipmentError) throw shipmentError;

    // Remove items from inventory
    const itemIdsToRemove = items.map(i => i.id);

    const { error: deleteError } = await supabase
        .from('inventory_items')
        .delete()
        .eq('user_id', userId)
        .in('id', itemIdsToRemove);

    if (deleteError) throw deleteError;

    return newShipment;
};

export const getShipments = async (userId: string): Promise<Shipment[]> => {
    const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(s => ({
        id: s.id,
        items: s.items,
        address: s.address,
        status: s.status,
        trackingNumber: s.tracking_number,
        createdAt: s.created_at,
    }));
};
