import { Order, LootItem, LootBox } from '../types';
import { addTransaction } from './walletService';

let orders: Order[] = [];

export const createOrder = async (userId: string, box: LootBox, items: LootItem[]): Promise<Order> => {
    // 1. Deduct funds
    await addTransaction(userId, 'PURCHASE', box.price, `Opened box: ${box.name}`);

    // 2. Create Order
    const order: Order = {
        id: Math.random().toString(36).substring(7),
        userId: userId,
        boxId: box.id,
        items: items,
        totalPrice: box.price,
        timestamp: Date.now(),
    };

    orders.unshift(order);

    // 3. Track Affiliate Commission
    try {
        // Import dynamically to avoid circular dependencies
        const { trackWager } = await import('./affiliateService');
        await trackWager(userId, box.price);
    } catch (e) {
        console.error('Failed to track affiliate wager:', e);
    }

    return order;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
    return orders.filter(o => o.userId === userId);
};
