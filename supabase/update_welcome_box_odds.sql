-- Update the WELCOME GIFT box with new odds
UPDATE boxes
SET items = '[
  {
    "id": "pc12",
    "name": "LootVibe $10 Voucher",
    "value": 10,
    "rarity": "COMMON",
    "odds": 99.999,
    "image": "https://hpflcuyxmwzrknxjgavd.supabase.co/storage/v1/object/public/game-assets/items/pc12.webp"
  },
  {
    "id": "p1",
    "name": "PSA 10 Charizard Base Set 1st Edition",
    "value": 250000,
    "rarity": "LEGENDARY",
    "odds": 0.00025,
    "image": "https://hpflcuyxmwzrknxjgavd.supabase.co/storage/v1/object/public/game-assets/items/p1.webp"
  },
  {
    "id": "rtx1",
    "name": "Gigabyte Nvidia GeForce RTX 5090 Aorus Master",
    "value": 2970,
    "rarity": "LEGENDARY",
    "odds": 0.00025,
    "image": "https://hpflcuyxmwzrknxjgavd.supabase.co/storage/v1/object/public/game-assets/items/rtx1.webp"
  },
  {
    "id": "son1",
    "name": "Supreme Meissen Hand-Painted Porcelain Cupid",
    "value": 6393.6,
    "rarity": "LEGENDARY",
    "odds": 0.00025,
    "image": "https://hpflcuyxmwzrknxjgavd.supabase.co/storage/v1/object/public/game-assets/items/son1.webp"
  },
  {
    "id": "cz1",
    "name": "Charizard ex 151 SIR PSA 10",
    "value": 200,
    "rarity": "EPIC",
    "odds": 0.0001,
    "image": "https://hpflcuyxmwzrknxjgavd.supabase.co/storage/v1/object/public/game-assets/items/cz1.webp"
  },
  {
    "id": "ap5",
    "name": "Apple AirPods Max",
    "value": 549,
    "rarity": "EPIC",
    "odds": 0.0001,
    "image": "https://hpflcuyxmwzrknxjgavd.supabase.co/storage/v1/object/public/game-assets/items/ap5.webp"
  },
  {
    "id": "ap6",
    "name": "Apple iPad Pro 12.9\" M2",
    "value": 1099,
    "rarity": "EPIC",
    "odds": 0.0001,
    "image": "https://hpflcuyxmwzrknxjgavd.supabase.co/storage/v1/object/public/game-assets/items/ap6.webp"
  },
  {
    "id": "rtx5",
    "name": "Nvidia GeForce RTX 4080 Super",
    "value": 999,
    "rarity": "EPIC",
    "odds": 0.0001,
    "image": "https://hpflcuyxmwzrknxjgavd.supabase.co/storage/v1/object/public/game-assets/items/rtx5.webp"
  },
  {
    "id": "sam3",
    "name": "Samsung Galaxy S24 Ultra",
    "value": 1199,
    "rarity": "EPIC",
    "odds": 0.0001,
    "image": "https://hpflcuyxmwzrknxjgavd.supabase.co/storage/v1/object/public/game-assets/items/sam3.webp"
  },
  {
    "id": "sw3",
    "name": "Nintendo Switch OLED",
    "value": 349,
    "rarity": "RARE",
    "odds": 0.0001,
    "image": "https://hpflcuyxmwzrknxjgavd.supabase.co/storage/v1/object/public/game-assets/items/sw3.webp"
  }
]'::jsonb
WHERE id = 'welcome_gift';
