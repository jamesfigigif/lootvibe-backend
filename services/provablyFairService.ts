import { LootItem } from '../types';
import CryptoJS from 'crypto-js';

// In a real app, the server seed is hidden on the server until rotated.
// Here we simulate it by keeping it in memory but not exposing it directly in the outcome until necessary (or hashed).
let activeServerSeed = generateServerSeed();

export function generateServerSeed(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

export function generateClientSeed(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}

export function hashSeed(seed: string): string {
  return CryptoJS.SHA256(seed).toString();
}

/**
 * Generates a result using HMAC-SHA256(serverSeed, clientSeed:nonce)
 * This is the standard Provably Fair algorithm.
 */
export const generateOutcome = async (
  items: LootItem[],
  clientSeed: string,
  nonce: number
): Promise<{ item: LootItem; serverSeed: string; serverSeedHash: string; nonce: number; randomValue: number; block: { height: number; hash: string } }> => {

  // 1. Calculate HMAC
  const message = `${clientSeed}:${nonce}`;
  const hmac = CryptoJS.HmacSHA256(message, activeServerSeed).toString();

  // 2. Take first 8 characters (32 bits) to generate a number
  // We take 8 chars (hex) -> 4 bytes. 
  // To get a float 0-1, we can take the first 52 bits (13 hex chars) like some sites, 
  // or standard 0-1 from entire hash.
  // Common method: Take first 8 chars, convert to int, divide by 2^32.
  const subHash = hmac.substring(0, 8);
  const decimal = parseInt(subHash, 16);
  const randomValue = decimal / Math.pow(2, 32); // 0.0 to 1.0

  // 3. Select Item based on weights
  const totalOdds = items.reduce((acc, item) => acc + item.odds, 0);
  let cumulativeProbability = 0;
  let selectedItem = items[items.length - 1];

  for (const item of items) {
    const probability = item.odds / totalOdds;
    cumulativeProbability += probability;

    if (randomValue <= cumulativeProbability) {
      selectedItem = item;
      break;
    }
  }

  const result = {
    item: selectedItem,
    serverSeed: activeServerSeed, // In real app, you might only reveal this AFTER rotation or for this specific roll if design allows
    serverSeedHash: hashSeed(activeServerSeed),
    nonce,
    randomValue,
    block: {
      height: 840000 + Math.floor(Math.random() * 1000),
      hash: "0000000000000000000" + CryptoJS.lib.WordArray.random(20).toString()
    }
  };

  // Rotate seed for next turn (optional, or keep same seed and increment nonce)
  // For this simulation, we'll keep the seed but the user should increment nonce.

  return result;
};

export const verifyOutcome = (
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number => {
  const message = `${clientSeed}:${nonce}`;
  const hmac = CryptoJS.HmacSHA256(message, serverSeed).toString();
  const subHash = hmac.substring(0, 8);
  const decimal = parseInt(subHash, 16);
  return decimal / Math.pow(2, 32);
};

export const rotateServerSeed = () => {
  activeServerSeed = generateServerSeed();
  return hashSeed(activeServerSeed);
};

export const getServerSeedHash = () => {
  return hashSeed(activeServerSeed);
}