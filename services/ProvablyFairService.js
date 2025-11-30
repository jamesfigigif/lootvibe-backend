const crypto = require('crypto');

class ProvablyFairService {
    constructor() {
        this.activeServerSeed = this.generateServerSeed();
    }

    generateServerSeed() {
        return crypto.randomBytes(32).toString('hex');
    }

    hashSeed(seed) {
        return crypto.createHash('sha256').update(seed).digest('hex');
    }

    rotateServerSeed() {
        this.activeServerSeed = this.generateServerSeed();
        return this.hashSeed(this.activeServerSeed);
    }

    getServerSeedHash() {
        return this.hashSeed(this.activeServerSeed);
    }

    /**
     * Generates a result using HMAC-SHA256(serverSeed, clientSeed:nonce)
     */
    async generateOutcome(items, clientSeed, nonce) {
        // 1. Calculate HMAC
        const message = `${clientSeed}:${nonce}`;
        const hmac = crypto.createHmac('sha256', this.activeServerSeed)
            .update(message)
            .digest('hex');

        // 2. Take first 8 characters (32 bits) to generate a number
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

        return {
            item: selectedItem,
            serverSeed: this.activeServerSeed, // In a real app, you'd hide this until rotation
            serverSeedHash: this.hashSeed(this.activeServerSeed),
            nonce,
            randomValue,
            block: {
                height: 840000 + Math.floor(Math.random() * 1000),
                hash: "0000000000000000000" + crypto.randomBytes(20).toString('hex')
            }
        };
    }
}

module.exports = new ProvablyFairService();
