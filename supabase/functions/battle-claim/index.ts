import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Verify Authorization (Anon Key)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing authorization' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 2. Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { battleId, prizeChoice, amount, items, userId } = await req.json();

        if (!battleId || !prizeChoice || !userId) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing required parameters' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`🔍 Processing claim for User ${userId}, Battle ${battleId}, Type: ${prizeChoice}`);

        // ✅ SECURITY: Verify battle exists and user is the winner
        const { data: battle, error: battleError } = await supabaseAdmin
            .from('battles')
            .select('id, winner_id, status, winner_total_value')
            .eq('id', battleId)
            .single();

        if (battleError || !battle) {
            console.error('❌ Battle not found:', battleId, battleError);
            throw new Error('Battle not found');
        }

        // Verify battle is finished
        if (battle.status !== 'FINISHED') {
            console.error(`❌ Battle ${battleId} is not finished (status: ${battle.status})`);
            throw new Error('Battle is not finished yet');
        }

        // Verify user is the winner
        if (battle.winner_id !== userId) {
            console.error(`❌ Unauthorized claim: User ${userId} tried to claim Battle ${battleId} (winner: ${battle.winner_id})`);
            throw new Error('You are not the winner of this battle');
        }

        // ✅ SECURITY: Check if prize already claimed
        const { data: existingClaim } = await supabaseAdmin
            .from('battle_results')
            .select('claimed')
            .eq('battle_id', battleId)
            .eq('winner_id', userId)
            .single();

        if (existingClaim && existingClaim.claimed) {
            console.error(`❌ Prize already claimed for Battle ${battleId}`);
            throw new Error('Prize already claimed');
        }

        console.log(`✅ Verified: User ${userId} is winner of Battle ${battleId}`);

        // Award the prize
        if (prizeChoice === 'cash') {
            if (!amount || amount <= 0) throw new Error('Invalid amount');

            // Create transaction record
            const { error: txError } = await supabaseAdmin.from('transactions').insert({
                id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                user_id: userId,
                type: 'WIN',
                amount: amount,
                description: `Battle victory prize (Battle ID: ${battleId})`,
                timestamp: Date.now()
            });

            if (txError) throw txError;

            // Update user balance
            const { data: userData, error: userError } = await supabaseAdmin
                .from('users').select('balance').eq('id', userId).single();

            if (userError) {
                console.error('User not found in Supabase:', userId);
                throw new Error('User not found');
            }

            const newBalance = (parseFloat((userData as any).balance) || 0) + amount;
            const { error: updateError } = await supabaseAdmin
                .from('users').update({ balance: newBalance }).eq('id', userId);
            if (updateError) throw updateError;

        } else if (prizeChoice === 'items') {
            if (!items || !Array.isArray(items) || items.length === 0) throw new Error('Invalid items');

            const inventoryInserts = items.map((item: any) => ({
                id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                user_id: userId,
                item_data: item,
                created_at: new Date().toISOString()
            }));

            const { error: invError } = await supabaseAdmin.from('inventory_items').insert(inventoryInserts);
            if (invError) throw invError;
        } else {
            throw new Error('Invalid prize choice');
        }

        // ✅ SECURITY: Mark prize as claimed to prevent double-claiming
        if (existingClaim) {
            // Update existing record
            await supabaseAdmin
                .from('battle_results')
                .update({ claimed: true })
                .eq('battle_id', battleId)
                .eq('winner_id', userId);
        } else {
            // Create new record (fallback if battle-spin didn't create it)
            await supabaseAdmin
                .from('battle_results')
                .insert({
                    battle_id: battleId,
                    winner_id: userId,
                    total_value: battle.winner_total_value || amount || 0,
                    items: items || null,
                    claimed: true
                });
        }

        console.log(`✅ Prize claimed successfully for Battle ${battleId} by User ${userId}`);

        return new Response(
            JSON.stringify({ success: true, message: 'Prize claimed successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        console.error('❌ Claim error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error?.message ?? String(error) }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
});
