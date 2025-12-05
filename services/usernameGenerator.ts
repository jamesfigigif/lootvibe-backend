/**
 * Cool username generator for LootVibe
 * Generates short, memorable usernames like "RedBeam" or "DarkStorm"
 */

const ADJECTIVES = [
    // Colors
    'Red', 'Blue', 'Dark', 'Gold', 'Silver', 'Crimson', 'Azure', 'Onyx', 'Pearl', 'Jade',
    'Ruby', 'Emerald', 'Sapphire', 'Amber', 'Violet', 'Cyan', 'Magenta', 'Lime', 'Frost',

    // Elements & Nature
    'Fire', 'Ice', 'Storm', 'Thunder', 'Shadow', 'Light', 'Star', 'Moon', 'Solar', 'Lunar',
    'Wind', 'Flame', 'Blaze', 'Crystal', 'Neon', 'Mystic', 'Cosmic', 'Quantum', 'Plasma',

    // Qualities
    'Swift', 'Silent', 'Epic', 'Noble', 'Wild', 'Lone', 'Elite', 'Prime', 'Alpha', 'Omega',
    'Savage', 'Stealth', 'Viper', 'Ghost', 'Phantom', 'Rogue', 'Ace', 'Pro', 'Master', 'Ultra'
];

const NOUNS = [
    // Nature
    'Wolf', 'Tiger', 'Dragon', 'Phoenix', 'Falcon', 'Hawk', 'Eagle', 'Raven', 'Fox', 'Bear',
    'Lion', 'Panther', 'Viper', 'Serpent', 'Cobra', 'Shark', 'Reaper', 'Lynx', 'Jaguar',

    // Abstract/Tech
    'Beam', 'Wave', 'Storm', 'Force', 'Pulse', 'Core', 'Blade', 'Strike', 'Nexus', 'Spark',
    'Flash', 'Blitz', 'Bolt', 'Surge', 'Nova', 'Edge', 'Fury', 'Rush', 'Dash', 'Hunter',

    // Gaming
    'Gamer', 'Slayer', 'Raider', 'Demon', 'Knight', 'Warrior', 'Mage', 'Ninja', 'Sniper',
    'Titan', 'Legend', 'Hero', 'Ace', 'King', 'Queen', 'Shadow', 'Phantom', 'Ghost'
];

/**
 * Generates a cool, random username
 * @returns A username like "RedBeam", "DarkStorm", etc.
 */
export function generateCoolUsername(): string {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];

    // Add a small random number suffix for uniqueness (1-9999)
    const randomNum = Math.floor(Math.random() * 9999) + 1;

    return `${adjective}${noun}${randomNum}`;
}

/**
 * Generates a cool, random username without numbers (for display purposes)
 * @returns A username like "RedBeam", "DarkStorm", etc.
 */
export function generateCoolUsernameNoNumbers(): string {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];

    return `${adjective}${noun}`;
}
