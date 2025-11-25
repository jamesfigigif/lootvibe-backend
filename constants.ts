
import { LootBox, LootItem, Rarity, LiveDrop, BoxCategory, Battle } from './types';
import { getItemsForBox } from './data/itemDatabase';

export const RARITY_COLORS = {
  [Rarity.COMMON]: 'border-slate-500 text-slate-400 shadow-none',
  [Rarity.UNCOMMON]: 'border-blue-500 text-blue-400 shadow-blue-500/20',
  [Rarity.RARE]: 'border-purple-500 text-purple-400 shadow-purple-500/30',
  [Rarity.EPIC]: 'border-pink-500 text-pink-400 shadow-pink-500/40',
  [Rarity.LEGENDARY]: 'border-yellow-400 text-yellow-400 shadow-yellow-400/50',
};

export const RARITY_BG = {
  [Rarity.COMMON]: 'bg-slate-500',
  [Rarity.UNCOMMON]: 'bg-blue-600',
  [Rarity.RARE]: 'bg-purple-600',
  [Rarity.EPIC]: 'bg-pink-600',
  [Rarity.LEGENDARY]: 'bg-yellow-500',
};

export const RARITY_GRADIENTS = {
  [Rarity.COMMON]: 'from-slate-700 to-slate-900',
  [Rarity.UNCOMMON]: 'from-blue-600 to-blue-900',
  [Rarity.RARE]: 'from-purple-600 to-purple-900',
  [Rarity.EPIC]: 'from-pink-600 to-pink-900',
  [Rarity.LEGENDARY]: 'from-yellow-500 to-orange-700',
};

// --- Helper to create items ---
const createItem = (id: string, name: string, value: number, rarity: Rarity, odds: number, image: string): LootItem => ({
  id, name, value, rarity, odds, image
});

// --- NEW BOX ITEMS ---

const POKEMON_ITEMS: LootItem[] = [
  // GRAILS (0.1% - 1%)
  createItem('p1', 'PSA 10 Charizard Base Set 1st Edition', 250000, Rarity.LEGENDARY, 0.01, 'https://placehold.co/200x200/fbbf24/000000?text=Base+Set+Zard'),
  createItem('p2', 'PSA 10 Moonbreon (Umbreon VMAX Alt)', 1100, Rarity.LEGENDARY, 0.1, 'https://placehold.co/200x200/fbbf24/000000?text=Moonbreon'),
  createItem('p3', 'Sealed Team Up Booster Box', 2100, Rarity.LEGENDARY, 0.05, 'https://placehold.co/200x200/fbbf24/000000?text=Team+Up+Box'),
  createItem('p4', 'PSA 10 Giratina V Alt Art', 800, Rarity.LEGENDARY, 0.2, 'https://placehold.co/200x200/fbbf24/000000?text=Giratina+V'),

  // HIGH TIER (1% - 5%)
  createItem('p5', 'Sealed Evolving Skies Booster Box', 750, Rarity.EPIC, 1, 'https://placehold.co/200x200/a855f7/ffffff?text=Evolving+Skies+BB'),
  createItem('p6', 'Pokemon 151 Ultra Premium Collection', 130, Rarity.EPIC, 3, 'https://placehold.co/200x200/a855f7/ffffff?text=151+UPC'),
  createItem('p7', 'Charizard ex (151 SIR)', 110, Rarity.EPIC, 4, 'https://placehold.co/200x200/a855f7/ffffff?text=Zard+151'),
  createItem('p8', 'Iono Special Illustration Rare', 85, Rarity.EPIC, 5, 'https://placehold.co/200x200/a855f7/ffffff?text=Iono+SIR'),

  // MID TIER (5% - 20%)
  createItem('p9', 'Crown Zenith Elite Trainer Box', 55, Rarity.RARE, 8, 'https://placehold.co/200x200/3b82f6/ffffff?text=Crown+Zenith+ETB'),
  createItem('p10', 'Lost Origin Booster Box', 140, Rarity.RARE, 5, 'https://placehold.co/200x200/3b82f6/ffffff?text=Lost+Origin+BB'),
  createItem('p11', 'Charizard UPC Promo Card', 25, Rarity.RARE, 15, 'https://placehold.co/200x200/3b82f6/ffffff?text=Zard+Promo'),
  createItem('p12', 'Arceus VSTAR Gold Card', 60, Rarity.RARE, 10, 'https://placehold.co/200x200/3b82f6/ffffff?text=Arceus+Gold'),

  // LOW TIER (Common)
  createItem('p13', 'Sleeved Booster Pack (Latest Set)', 5, Rarity.COMMON, 15, 'https://placehold.co/200x200/94a3b8/000000?text=Booster+Pack'),
  createItem('p14', '3-Pack Blister (Random)', 15, Rarity.COMMON, 10, 'https://placehold.co/200x200/94a3b8/000000?text=3-Pack+Blister'),
  createItem('p15', 'Pokemon Sticker Pack', 2, Rarity.COMMON, 15, 'https://placehold.co/200x200/94a3b8/000000?text=Sticker+Pack'),
  createItem('p16', 'Single Holo Rare Card', 1, Rarity.COMMON, 8.64, 'https://placehold.co/200x200/94a3b8/000000?text=Holo+Card'),
];

// CHARIZARD CHASE BOX - $50 box, ~$30 EV (60% profitability)
const CHARIZARD_ITEMS: LootItem[] = [
  createItem('cz1', 'Charizard ex 151 SIR PSA 10', 200, Rarity.LEGENDARY, 0.5, 'https://placehold.co/200x200/fbbf24/000000?text=Zard+151+PSA'),
  createItem('cz2', 'Charizard VMAX Rainbow Rare', 85, Rarity.LEGENDARY, 1, 'https://placehold.co/200x200/fbbf24/000000?text=Zard+VMAX'),
  createItem('cz3', 'Charizard V Alt Art (Brilliant Stars)', 65, Rarity.EPIC, 2, 'https://placehold.co/200x200/a855f7/ffffff?text=Zard+V+Alt'),
  createItem('cz4', 'Charizard ex 151 Regular', 35, Rarity.EPIC, 5, 'https://placehold.co/200x200/a855f7/ffffff?text=Zard+ex'),
  createItem('cz5', 'Charizard VSTAR', 12, Rarity.RARE, 10, 'https://placehold.co/200x200/3b82f6/ffffff?text=Zard+VSTAR'),
  createItem('cz6', 'Charizard Holo (Base Set Reprint)', 8, Rarity.RARE, 15, 'https://placehold.co/200x200/3b82f6/ffffff?text=Zard+Holo'),
  createItem('cz7', 'Charizard V (Regular)', 5, Rarity.COMMON, 30, 'https://placehold.co/200x200/94a3b8/000000?text=Zard+V'),
  createItem('cz8', 'Charizard Reverse Holo', 2, Rarity.COMMON, 36.5, 'https://placehold.co/200x200/94a3b8/000000?text=Zard+Rev'),
];

// POKEMON BUDGET BOX - $8 box, ~$4.80 EV (60% profitability)
const POKEMON_BUDGET_ITEMS: LootItem[] = [
  createItem('pb1', 'Pokemon 151 ETB', 65, Rarity.LEGENDARY, 0.2, 'https://placehold.co/200x200/fbbf24/000000?text=151+ETB'),
  createItem('pb2', 'Iono Full Art', 18, Rarity.LEGENDARY, 1, 'https://placehold.co/200x200/fbbf24/000000?text=Iono+FA'),
  createItem('pb3', 'Booster Bundle (3 Packs)', 12, Rarity.EPIC, 3, 'https://placehold.co/200x200/a855f7/ffffff?text=3+Pack+Bundle'),
  createItem('pb4', 'Holo Rare (Random)', 5, Rarity.EPIC, 8, 'https://placehold.co/200x200/a855f7/ffffff?text=Holo+Rare'),
  createItem('pb5', 'Single Booster Pack', 4, Rarity.RARE, 20, 'https://placehold.co/200x200/3b82f6/ffffff?text=Booster'),
  createItem('pb6', 'Reverse Holo Rare', 2, Rarity.COMMON, 30, 'https://placehold.co/200x200/94a3b8/000000?text=Rev+Holo'),
  createItem('pb7', 'Pokemon Coin', 1, Rarity.COMMON, 37.8, 'https://placehold.co/200x200/94a3b8/000000?text=Coin'),
];

// MODERN HITS BOX - $35 box, ~$21 EV (60% profitability)
const MODERN_HITS_ITEMS: LootItem[] = [
  createItem('mh1', 'Iono Special Illustration Rare', 90, Rarity.LEGENDARY, 0.3, 'https://placehold.co/200x200/fbbf24/000000?text=Iono+SIR'),
  createItem('mh2', 'Giratina V Alt Art', 75, Rarity.LEGENDARY, 0.5, 'https://placehold.co/200x200/fbbf24/000000?text=Giratina+Alt'),
  createItem('mh3', 'Umbreon VMAX (Evolving Skies)', 55, Rarity.EPIC, 1.5, 'https://placehold.co/200x200/a855f7/ffffff?text=Umbreon+VMAX'),
  createItem('mh4', 'Rayquaza VMAX Alt Art', 180, Rarity.EPIC, 0.2, 'https://placehold.co/200x200/a855f7/ffffff?text=Ray+VMAX'),
  createItem('mh5', 'Crown Zenith ETB', 50, Rarity.EPIC, 2, 'https://placehold.co/200x200/a855f7/ffffff?text=CZ+ETB'),
  createItem('mh6', 'Booster Box (Latest Set)', 110, Rarity.RARE, 0.8, 'https://placehold.co/200x200/3b82f6/ffffff?text=BB+Latest'),
  createItem('mh7', 'Elite Trainer Box', 45, Rarity.RARE, 8, 'https://placehold.co/200x200/3b82f6/ffffff?text=ETB'),
  createItem('mh8', '3-Pack Blister', 12, Rarity.COMMON, 35, 'https://placehold.co/200x200/94a3b8/000000?text=3-Pack'),
  createItem('mh9', 'Single Pack', 4, Rarity.COMMON, 51.7, 'https://placehold.co/200x200/94a3b8/000000?text=Single+Pack'),
];

// VINTAGE VAULT BOX - $150 box, ~$90 EV (60% profitability)
const VINTAGE_VAULT_ITEMS: LootItem[] = [
  createItem('vv1', 'Base Set Booster Box (Unlimited)', 4500, Rarity.LEGENDARY, 0.05, 'https://placehold.co/200x200/fbbf24/000000?text=Base+Set+BB'),
  createItem('vv2', 'Fossil Booster Box (1st Edition)', 3200, Rarity.LEGENDARY, 0.08, 'https://placehold.co/200x200/fbbf24/000000?text=Fossil+1st+BB'),
  createItem('vv3', 'Team Rocket Booster Box', 2800, Rarity.LEGENDARY, 0.1, 'https://placehold.co/200x200/fbbf24/000000?text=Rocket+BB'),
  createItem('vv4', 'Neo Genesis Booster Box', 1900, Rarity.EPIC, 0.2, 'https://placehold.co/200x200/a855f7/ffffff?text=Neo+Genesis'),
  createItem('vv5', 'Gym Heroes Booster Box', 1400, Rarity.EPIC, 0.3, 'https://placehold.co/200x200/a855f7/ffffff?text=Gym+Heroes'),
  createItem('vv6', 'Base Set 2 Booster Box', 900, Rarity.EPIC, 0.5, 'https://placehold.co/200x200/a855f7/ffffff?text=Base+Set+2'),
  createItem('vv7', 'Jungle Booster Pack (Heavy)', 180, Rarity.RARE, 3, 'https://placehold.co/200x200/3b82f6/ffffff?text=Jungle+Pack'),
  createItem('vv8', 'Vintage Holo Lot (5 cards)', 85, Rarity.RARE, 8, 'https://placehold.co/200x200/3b82f6/ffffff?text=Holo+Lot'),
  createItem('vv9', 'WOTC Common/Uncommon Lot', 25, Rarity.COMMON, 35, 'https://placehold.co/200x200/94a3b8/000000?text=WOTC+Lot'),
  createItem('vv10', 'Vintage Energy Cards (10x)', 8, Rarity.COMMON, 52.77, 'https://placehold.co/200x200/94a3b8/000000?text=Energy+Cards'),
];

const FOOD_ITEMS: LootItem[] = [
  createItem('f1', '$500 DoorDash Gift Card', 500, Rarity.LEGENDARY, 1, 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=200'),
  createItem('f2', '$200 Uber Eats Credit', 200, Rarity.EPIC, 2, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200'),
  createItem('f3', '$100 Grubhub Gift Card', 100, Rarity.EPIC, 5, 'https://images.unsplash.com/photo-1588466585717-f8041aec7875?w=200'),
  createItem('f4', '$75 Multi-Restaurant Card', 75, Rarity.EPIC, 7, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'),
  createItem('f5', '$50 DoorDash Card', 50, Rarity.RARE, 15, 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=200'),
  createItem('f6', '$30 Restaurant.com eGift', 30, Rarity.RARE, 10, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'),
  createItem('f7', '$20 Fast Food Gift Card', 20, Rarity.COMMON, 20, 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=200'),
  createItem('f8', '$10 Coffee Shop Card', 10, Rarity.COMMON, 25, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200'),
  createItem('f9', '$5 Snack Credit', 5, Rarity.COMMON, 15, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200'),
];

const SNEAKER_ITEMS: LootItem[] = [
  createItem('s1', 'Dior x Jordan 1 High', 5000, Rarity.LEGENDARY, 0.5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'),
  createItem('s2', 'Travis Scott Jordan 1 Low', 1200, Rarity.LEGENDARY, 1, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'),
  createItem('s3', 'Off-White Dunk Low Pine Green', 900, Rarity.EPIC, 2.5, 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=200'),
  createItem('s4', 'Jordan 4 Military Black', 350, Rarity.EPIC, 6, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200'),
  createItem('s5', 'Jordan 1 High University Blue', 280, Rarity.RARE, 10, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'),
  createItem('s6', 'Yeezy 350 V2 Beluga', 250, Rarity.RARE, 10, 'https://images.unsplash.com/photo-1622404267481-e1ca9dc2a51b?w=200'),
  createItem('s7', 'Nike Dunk Low Panda', 180, Rarity.RARE, 10, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200'),
  createItem('s8', 'New Balance 550 White Green', 140, Rarity.COMMON, 30, 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=200'),
  createItem('s9', 'Nike Air Force 1 White', 110, Rarity.COMMON, 30, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200'),
];

const STEAM_ITEMS: LootItem[] = [
  createItem('st1', 'Steam Deck OLED 1TB', 649, Rarity.LEGENDARY, 0.5, 'https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?w=200'),
  createItem('st2', 'ASUS ROG Ally', 399, Rarity.LEGENDARY, 1, 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=200'),
  createItem('st3', '$200 Steam Gift Card', 200, Rarity.EPIC, 2.5, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200'),
  createItem('st4', '$100 Steam Gift Card', 100, Rarity.EPIC, 5, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200'),
  createItem('st5', 'Premium Game Bundle (5 AAA)', 150, Rarity.EPIC, 4, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200'),
  createItem('st6', '$50 Steam Gift Card', 50, Rarity.RARE, 18, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200'),
  createItem('st7', 'AAA Game Key (Elden Ring/BG3)', 60, Rarity.RARE, 9, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200'),
  createItem('st8', 'Indie Game Bundle (10 games)', 30, Rarity.COMMON, 30, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200'),
  createItem('st9', '$10 Steam Gift Card', 10, Rarity.COMMON, 30, 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200'),
];

const TECH_ITEMS: LootItem[] = [
  createItem('t1', 'MacBook Pro 14" M3 Pro', 1999, Rarity.LEGENDARY, 1, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200'),
  createItem('t2', 'MacBook Air 15" M2', 1099, Rarity.LEGENDARY, 2, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200'),
  createItem('t3', 'iPhone 15 Pro 256GB', 999, Rarity.EPIC, 2, 'https://images.unsplash.com/photo-1592286927505-2fd2c2e68e4d?w=200'),
  createItem('t4', 'iPad Pro 11" M2', 799, Rarity.EPIC, 3, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200'),
  createItem('t5', 'iPhone 15 128GB', 799, Rarity.EPIC, 4, 'https://images.unsplash.com/photo-1592286927505-2fd2c2e68e4d?w=200'),
  createItem('t6', 'iPad Air M1 256GB', 599, Rarity.RARE, 5, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200'),
  createItem('t7', 'Apple Watch Series 9 GPS', 399, Rarity.RARE, 8, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200'),
  createItem('t8', 'AirPods Pro 2nd Gen', 249, Rarity.RARE, 15, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200'),
  createItem('t9', 'Apple Magic Keyboard + Mouse', 99, Rarity.COMMON, 60, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200'),
];

const SUPREME_ITEMS: LootItem[] = [
  createItem('su1', 'Supreme x Louis Vuitton Box Logo', 5000, Rarity.LEGENDARY, 0.5, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200'),
  createItem('su2', 'Supreme Box Logo Hoodie (Red)', 1500, Rarity.LEGENDARY, 1, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200'),
  createItem('su3', 'Supreme x TNF Nuptse Jacket', 800, Rarity.EPIC, 2.5, 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=200'),
  createItem('su4', 'Supreme x Nike SB Dunk Low', 600, Rarity.EPIC, 4, 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=200'),
  createItem('su5', 'Supreme Box Logo Tee', 250, Rarity.RARE, 10, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'),
  createItem('su6', 'Supreme Hoodie (Season Drop)', 180, Rarity.RARE, 10, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200'),
  createItem('su7', 'Supreme Accessories (Belt/Bag)', 150, Rarity.RARE, 12, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200'),
  createItem('su8', 'Supreme Camp Cap', 80, Rarity.COMMON, 30, 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=200'),
  createItem('su9', 'Supreme Sticker Pack + Keychain', 10, Rarity.COMMON, 30, 'https://images.unsplash.com/photo-1611390828332-4b0f17bc4d8c?w=200'),
];


const APPLE_BUDGET_ITEMS: LootItem[] = [
  createItem('ab1', 'iPhone 12 (Refurbished)', 350, Rarity.LEGENDARY, 0.5, '/assets/items/iphone_12_refurb.png'),
  createItem('ab2', 'iPad 9th Gen', 250, Rarity.LEGENDARY, 1, '/assets/items/ipad_9th_gen.png'),
  createItem('ab3', 'AirPods 2nd Gen', 99, Rarity.EPIC, 3, '/assets/items/airpods_2nd_gen.png'),
  createItem('ab4', 'Apple Pencil 2nd Gen', 89, Rarity.EPIC, 5, '/assets/items/apple_pencil_2.png'),
  createItem('ab5', 'AirTag 4-Pack', 85, Rarity.EPIC, 6, 'https://placehold.co/200x200/e2e8f0/475569?text=AirTag+4-Pack'),
  createItem('ab6', 'MagSafe Charger', 39, Rarity.RARE, 15, 'https://placehold.co/200x200/e2e8f0/475569?text=MagSafe+Charger'),
  createItem('ab7', 'Apple AirTag (Single)', 29, Rarity.RARE, 20, 'https://placehold.co/200x200/e2e8f0/475569?text=AirTag'),
  createItem('ab8', 'Apple Polishing Cloth', 19, Rarity.COMMON, 25, 'https://placehold.co/200x200/e2e8f0/475569?text=Polishing+Cloth'),
  createItem('ab9', 'USB-C to Lightning Cable', 15, Rarity.COMMON, 24.5, 'https://placehold.co/200x200/e2e8f0/475569?text=Lightning+Cable'),
];

const SAMSUNG_BUDGET_ITEMS: LootItem[] = [
  createItem('sb1', 'Samsung Galaxy A54', 350, Rarity.LEGENDARY, 0.5, 'https://placehold.co/200x200/3b82f6/ffffff?text=Galaxy+A54'),
  createItem('sb2', 'Galaxy Watch 6', 250, Rarity.LEGENDARY, 1, 'https://placehold.co/200x200/3b82f6/ffffff?text=Galaxy+Watch+6'),
  createItem('sb3', 'Galaxy Buds 2 Pro', 150, Rarity.EPIC, 3, 'https://placehold.co/200x200/3b82f6/ffffff?text=Galaxy+Buds+2'),
  createItem('sb4', 'Samsung T7 SSD 1TB', 89, Rarity.EPIC, 5, 'https://placehold.co/200x200/3b82f6/ffffff?text=T7+SSD'),
  createItem('sb5', 'Wireless Charger Trio', 60, Rarity.EPIC, 7, 'https://placehold.co/200x200/3b82f6/ffffff?text=Wireless+Charger'),
  createItem('sb6', 'SmartTag2 4-Pack', 50, Rarity.RARE, 15, 'https://placehold.co/200x200/3b82f6/ffffff?text=SmartTag2+4-Pack'),
  createItem('sb7', '45W Power Adapter', 35, Rarity.RARE, 20, 'https://placehold.co/200x200/3b82f6/ffffff?text=45W+Adapter'),
  createItem('sb8', 'SmartTag2 (Single)', 25, Rarity.COMMON, 25, 'https://placehold.co/200x200/3b82f6/ffffff?text=SmartTag2'),
  createItem('sb9', 'USB-C Cable', 10, Rarity.COMMON, 23.5, 'https://placehold.co/200x200/3b82f6/ffffff?text=USB-C+Cable'),
];

const GAMER_BUDGET_ITEMS: LootItem[] = [
  createItem('gb1', 'Razer Huntsman Mini', 120, Rarity.LEGENDARY, 0.5, 'https://placehold.co/200x200/10b981/ffffff?text=Razer+Huntsman'),
  createItem('gb2', 'Logitech G502 Hero', 50, Rarity.LEGENDARY, 2, 'https://placehold.co/200x200/10b981/ffffff?text=Logitech+G502'),
  createItem('gb3', 'HyperX Cloud Stinger 2', 40, Rarity.EPIC, 5, 'https://placehold.co/200x200/10b981/ffffff?text=HyperX+Cloud'),
  createItem('gb4', 'Xbox Wireless Controller', 60, Rarity.EPIC, 4, 'https://placehold.co/200x200/10b981/ffffff?text=Xbox+Controller'),
  createItem('gb5', 'Steam Gift Card $20', 20, Rarity.RARE, 15, 'https://placehold.co/200x200/10b981/ffffff?text=Steam+$20'),
  createItem('gb6', 'Razer Gigantus V2 (Large)', 15, Rarity.RARE, 20, 'https://placehold.co/200x200/10b981/ffffff?text=Mouse+Pad'),
  createItem('gb7', 'Steam Gift Card $10', 10, Rarity.COMMON, 25, 'https://placehold.co/200x200/10b981/ffffff?text=Steam+$10'),
  createItem('gb8', 'Random Steam Key (Indie)', 5, Rarity.COMMON, 20, 'https://placehold.co/200x200/10b981/ffffff?text=Steam+Key'),
  createItem('gb9', 'Cat 6 Ethernet Cable', 5, Rarity.COMMON, 8.5, 'https://placehold.co/200x200/10b981/ffffff?text=Ethernet+Cable'),
];

// --- BOX DEFINITIONS ---

export const INITIAL_BOXES: LootBox[] = [
  {
    id: 'pokemon_box',
    name: 'POKEMON TREASURE BOX',
    category: 'POKEMON',
    price: 75.00,
    image: '/assets/boxes/pokemon.png',
    description: 'Graded cards, booster boxes, and rare Pokemon collectibles',
    tags: ['HOT', 'FEATURED'],
    color: 'from-yellow-500 to-yellow-700',
    items: POKEMON_ITEMS
  },
  {
    id: 'food_box',
    name: 'FOOD DELIVERY BOX',
    category: 'FOOD',
    price: 30.00,
    image: '/assets/boxes/food.png',
    description: 'DoorDash, Uber Eats, and restaurant gift cards',
    tags: ['FEATURED'],
    color: 'from-orange-500 to-red-600',
    items: FOOD_ITEMS
  },
  {
    id: 'sneaker_box',
    name: 'SNEAKER GRAILS BOX',
    category: 'STREETWEAR',
    price: 300.00,
    image: '/assets/boxes/sneaker.png',
    description: 'Jordan 1s, Dunks, Yeezys - authentic heat only',
    tags: ['HOT', 'FEATURED'],
    color: 'from-purple-600 to-indigo-900',
    items: SNEAKER_ITEMS
  },
  {
    id: 'steam_box',
    name: 'STEAM VAULT BOX',
    category: 'TECH',
    price: 50.00,
    image: '/assets/boxes/steam.png',
    description: 'Steam gift cards, game keys, and gaming gear',
    tags: ['FEATURED', 'HOT'],
    color: 'from-blue-800 to-slate-900',
    items: STEAM_ITEMS
  },
  {
    id: 'tech_box',
    name: 'TECH PREMIUM BOX',
    category: 'TECH',
    price: 500.00,
    image: '/assets/boxes/tech.png',
    description: 'iPhone, iPad, MacBook, AirPods - latest Apple & tech',
    tags: ['FEATURED'],
    color: 'from-slate-700 to-slate-900',
    items: TECH_ITEMS
  },
  {
    id: 'supreme_box',
    name: 'SUPREME LEGACY BOX',
    category: 'STREETWEAR',
    price: 200.00,
    image: '/assets/boxes/supreme.png',
    description: 'Supreme Box Logo, accessories, and rare drops',
    tags: ['HOT', 'FEATURED', 'NEW'],
    color: 'from-red-600 to-red-900',
    items: SUPREME_ITEMS
  },
  {
    id: 'apple_budget',
    name: 'APPLE BUDGET BOX',
    category: 'TECH',
    price: 15.00,
    image: '/assets/boxes/apple_budget.png',
    description: 'Chance for iPhones and AirPods at a budget price',
    tags: ['NEW', 'HOT'],
    color: 'from-gray-200 to-gray-400',
    items: APPLE_BUDGET_ITEMS
  },
  {
    id: 'samsung_budget',
    name: 'SAMSUNG BUDGET BOX',
    category: 'TECH',
    price: 15.00,
    image: '/assets/boxes/samsung_budget.png',
    description: 'Galaxy gear, buds, and accessories for less',
    tags: ['NEW'],
    color: 'from-blue-400 to-blue-600',
    items: SAMSUNG_BUDGET_ITEMS
  },
  {
    id: 'gamer_budget',
    name: 'GAMER BUDGET BOX',
    category: 'TECH',
    price: 10.00,
    image: '/assets/boxes/gamer_budget.png',
    description: 'Peripherals, steam keys, and gaming essentials',
    tags: ['NEW'],
    color: 'from-green-400 to-emerald-600',
    items: GAMER_BUDGET_ITEMS
  },
  {
    id: 'charizard_chase',
    name: 'CHARIZARD CHASE BOX',
    category: 'POKEMON',
    price: 50.00,
    image: 'https://placehold.co/500x500/ef4444/ffffff?text=Charizard+Chase',
    description: 'Hunt for rare Charizard cards - PSA 10s, Alt Arts, and more',
    tags: ['HOT', 'FEATURED'],
    color: 'from-red-500 to-orange-600',
    items: CHARIZARD_ITEMS
  },
  {
    id: 'pokemon_budget',
    name: 'POKEMON BUDGET BOX',
    category: 'POKEMON',
    price: 8.00,
    image: 'https://placehold.co/500x500/fbbf24/000000?text=Pokemon+Budget',
    description: 'Affordable Pokemon packs and cards for everyone',
    tags: ['NEW'],
    color: 'from-yellow-400 to-yellow-600',
    items: POKEMON_BUDGET_ITEMS
  },
  {
    id: 'modern_hits',
    name: 'MODERN HITS BOX',
    category: 'POKEMON',
    price: 35.00,
    image: 'https://placehold.co/500x500/8b5cf6/ffffff?text=Modern+Hits',
    description: 'Latest sets - Iono, Giratina, Umbreon, and more modern chase cards',
    tags: ['FEATURED'],
    color: 'from-purple-500 to-indigo-600',
    items: MODERN_HITS_ITEMS
  },
  {
    id: 'vintage_vault',
    name: 'VINTAGE VAULT BOX',
    category: 'POKEMON',
    price: 150.00,
    image: 'https://placehold.co/500x500/64748b/ffffff?text=Vintage+Vault',
    description: 'WOTC era sealed product - Base Set, Fossil, Jungle, and more',
    tags: ['HOT'],
    color: 'from-slate-600 to-slate-800',
    items: VINTAGE_VAULT_ITEMS
  }
];

export const MOCK_LIVE_DROPS: LiveDrop[] = [
  { id: 'ld1', username: 'TechNinja', itemName: 'iPhone 15 Pro', itemImage: 'https://ui-avatars.com/api/?name=I&background=eab308&color=fff', boxName: 'TECH PREMIUM BOX', value: 999.00, rarity: Rarity.EPIC, timeAgo: 'just now' },
  { id: 'ld2', username: 'GamerPro', itemName: 'Steam Deck OLED', itemImage: 'https://ui-avatars.com/api/?name=S&background=3b82f6&color=fff', boxName: 'STEAM VAULT BOX', value: 649.00, rarity: Rarity.LEGENDARY, timeAgo: '12s ago' },
  { id: 'ld3', username: 'BudgetKing', itemName: 'AirPods 2nd Gen', itemImage: 'https://ui-avatars.com/api/?name=A&background=a855f7&color=fff', boxName: 'APPLE BUDGET BOX', value: 99.00, rarity: Rarity.EPIC, timeAgo: '20s ago' },
  { id: 'ld4', username: 'TreasureTom', itemName: 'Charizard Base Set', itemImage: 'https://ui-avatars.com/api/?name=C&background=a855f7&color=fff', boxName: 'POKEMON TREASURE BOX', value: 3000.00, rarity: Rarity.LEGENDARY, timeAgo: '45s ago' },
  { id: 'ld5', username: 'HypeBeast', itemName: 'Supreme Box Logo', itemImage: 'https://ui-avatars.com/api/?name=S&background=f43f5e&color=fff', boxName: 'SUPREME LEGACY BOX', value: 1500.00, rarity: Rarity.LEGENDARY, timeAgo: '1m ago' },
  { id: 'ld6', username: 'SamsungFan', itemName: 'Galaxy Buds 2 Pro', itemImage: 'https://ui-avatars.com/api/?name=G&background=3b82f6&color=fff', boxName: 'SAMSUNG BUDGET BOX', value: 150.00, rarity: Rarity.EPIC, timeAgo: '1m ago' },
];

export const REALISTIC_DROPS: LiveDrop[] = [
  { id: 'r1', username: 'CryptoWhale', itemName: 'MacBook Pro 14"', itemImage: 'https://ui-avatars.com/api/?name=M&background=eab308&color=fff', boxName: 'TECH PREMIUM BOX', value: 1999.00, rarity: Rarity.LEGENDARY, timeAgo: 'Just now' },
  { id: 'r2', username: 'SpeedyGonz', itemName: '$10 Steam Gift Card', itemImage: 'https://ui-avatars.com/api/?name=S&background=94a3b8&color=fff', boxName: 'STEAM VAULT BOX', value: 10.00, rarity: Rarity.COMMON, timeAgo: 'Just now' },
  { id: 'r3', username: 'LuckyLuke', itemName: 'Supreme Sticker Pack', itemImage: 'https://ui-avatars.com/api/?name=S&background=3b82f6&color=fff', boxName: 'SUPREME LEGACY BOX', value: 10.00, rarity: Rarity.COMMON, timeAgo: '2s ago' },
  { id: 'r4', username: 'PixelArt', itemName: 'Pokemon Sticker Pack', itemImage: 'https://ui-avatars.com/api/?name=P&background=94a3b8&color=fff', boxName: 'POKEMON TREASURE BOX', value: 1.00, rarity: Rarity.COMMON, timeAgo: '4s ago' },
  { id: 'r5', username: 'GamerGirl99', itemName: '$20 Fast Food Card', itemImage: 'https://ui-avatars.com/api/?name=F&background=3b82f6&color=fff', boxName: 'FOOD DELIVERY BOX', value: 20.00, rarity: Rarity.COMMON, timeAgo: '6s ago' },
  { id: 'r6', username: 'BudgetHunter', itemName: 'Apple Polishing Cloth', itemImage: 'https://ui-avatars.com/api/?name=A&background=94a3b8&color=fff', boxName: 'APPLE BUDGET BOX', value: 19.00, rarity: Rarity.COMMON, timeAgo: '8s ago' },
  { id: 'r7', username: 'AndroidUser', itemName: 'USB-C Cable', itemImage: 'https://ui-avatars.com/api/?name=U&background=94a3b8&color=fff', boxName: 'SAMSUNG BUDGET BOX', value: 10.00, rarity: Rarity.COMMON, timeAgo: '10s ago' },
  { id: 'r8', username: 'PCGamer', itemName: 'Random Steam Key', itemImage: 'https://ui-avatars.com/api/?name=R&background=94a3b8&color=fff', boxName: 'GAMER BUDGET BOX', value: 5.00, rarity: Rarity.COMMON, timeAgo: '12s ago' },
];

export const MOCK_BATTLES: Battle[] = [
  {
    id: 'b1',
    boxId: 'supreme_box',
    price: 200,
    playerCount: 2,
    players: [
      { id: 'u1', username: 'HypeBeast', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HypeBeast' },
      null
    ],
    status: 'WAITING',
    roundCount: 1
  },
  {
    id: 'b2',
    boxId: 'tech_box',
    price: 500,
    playerCount: 2,
    players: [
      { id: 'u2', username: 'PCMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PCMaster' },
      null
    ],
    status: 'WAITING',
    roundCount: 3
  },
  {
    id: 'b3',
    boxId: 'pokemon_box',
    price: 75,
    playerCount: 4,
    players: [
      { id: 'u3', username: 'AshK', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AshK' },
      { id: 'u4', username: 'Misty', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Misty' },
      null,
      null
    ],
    status: 'WAITING',
    roundCount: 1
  },
  {
    id: 'b5',
    boxId: 'steam_box',
    price: 50,
    playerCount: 2,
    players: [
      { id: 'u6', username: 'Gamer1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gamer1' },
      { id: 'u7', username: 'Gamer2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gamer2' },
    ],
    status: 'ACTIVE',
    roundCount: 1
  },
  {
    id: 'b6',
    boxId: 'apple_budget',
    price: 15,
    playerCount: 2,
    players: [
      { id: 'u8', username: 'AppleFan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AppleFan' },
      null
    ],
    status: 'WAITING',
    roundCount: 1
  }
];
