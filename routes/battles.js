const express = require('express');
const ProvablyFairService = require('../services/ProvablyFairService');

const router = express.Router();

// In-memory battle state (for demo purposes - ideally use Redis/DB)
const battles = {};

module.exports = (supabase) => {

    // Create a new battle
    router.post('/create', async (req, res) => {
        try {
            const { battleId, boxId, price, playerCount, mode, roundCount, creator } = req.body;

            battles[battleId] = {
                id: battleId,
                boxId,
                price,
                playerCount,
                mode,
                roundCount,
                players: [creator],
                status: 'WAITING',
                currentRound: 1,
                results: {},
                createdAt: Date.now()
            };

            res.json({ success: true, battle: battles[battleId] });
        } catch (error) {
            console.error('Error creating battle:', error);
            res.status(500).json({ error: 'Failed to create battle' });
        }
    });

    // Join a battle
    router.post('/join', async (req, res) => {
        try {
            const { battleId, user } = req.body;
            const battle = battles[battleId];

            if (!battle) {
                return res.status(404).json({ error: 'Battle not found' });
            }

            if (battle.players.length >= battle.playerCount) {
                return res.status(400).json({ error: 'Battle is full' });
            }

            battle.players.push(user);

            if (battle.players.length === battle.playerCount) {
                battle.status = 'ACTIVE';
            }

            res.json({ success: true, battle });
        } catch (error) {
            console.error('Error joining battle:', error);
            res.status(500).json({ error: 'Failed to join battle' });
        }
    });

    // Execute a spin (generate outcome)
    router.post('/spin', async (req, res) => {
        try {
            const { battleId, playerId, clientSeed, nonce, boxItems } = req.body;
            // Note: In a real app, fetch boxItems from DB using boxId to prevent client manipulation

            const outcome = await ProvablyFairService.generateOutcome(boxItems, clientSeed, nonce);

            res.json({
                success: true,
                outcome
            });
        } catch (error) {
            console.error('Error executing spin:', error);
            res.status(500).json({ error: 'Failed to execute spin' });
        }
    });

    // Get battle state
    router.get('/:battleId', (req, res) => {
        const battle = battles[req.params.battleId];
        if (!battle) {
            return res.status(404).json({ error: 'Battle not found' });
        }
        res.json(battle);
    });

    return router;
};
