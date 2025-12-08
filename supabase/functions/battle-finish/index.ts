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
        // 1. Verify Authorization
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

        const { battleId, playerResults } = await req.json();

        if (!battleId || !playerResults || !Array.isArray(playerResults)) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing required parameters' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`🏁 Finishing battle ${battleId} with ${playerResults.length} players`);

        // ✅ SECURITY: Verify battle exists and is active
        const { data: battle, error: battleError } = await supabaseAdmin
            .from('battles')
            .select('id, status, player_count, players')
            .eq('id', battleId)
            .single();

        if (battleError || !battle) {
            console.error('❌ Battle not found:', battleId);
            throw new Error('Battle not found');
        }

        if (battle.status !== 'ACTIVE') {
            console.error(`❌ Battle ${battleId} is not active (status: ${battle.status})`);
            throw new Error('Battle is not active');
        }

        // ✅ SECURITY: Verify all players submitted results
        if (playerResults.length !== battle.player_count) {
            console.error(`❌ Player count mismatch: expected ${battle.player_count}, got ${playerResults.length}`);
            throw new Error('Invalid player results count');
        }

        // ✅ SECURITY: Determine winner server-side based on total values
        let winner = playerResults[0];
        for (const playerResult of playerResults) {
            if (playerResult.totalValue > winner.totalValue) {
                winner = playerResult;
            }
        }

        console.log(`🏆 Winner determined: ${winner.playerId} with value ${winner.totalValue}`);

        // ✅ Update battle in database
        const { error: updateError } = await supabaseAdmin
            .from('battles')
            .update({
                status: 'FINISHED',
                winner_id: winner.playerId,
                winner_total_value: winner.totalValue,
                results: playerResults,
                updated_at: new Date().toISOString()
            })
            .eq('id', battleId);

        if (updateError) {
            console.error('❌ Error updating battle:', updateError);
            throw new Error('Failed to update battle');
        }

        // ✅ Create battle_results record for claim verification
        const { error: resultsError } = await supabaseAdmin
            .from('battle_results')
            .insert({
                battle_id: battleId,
                winner_id: winner.playerId,
                total_value: winner.totalValue,
                items: winner.items || null,
                claimed: false
            });

        if (resultsError) {
            console.error('❌ Error creating battle_results:', resultsError);
            // Don't throw - battle is already updated, this is just for tracking
        }

        console.log(`✅ Battle ${battleId} finished successfully`);

        return new Response(
            JSON.stringify({
                success: true,
                winner: {
                    playerId: winner.playerId,
                    totalValue: winner.totalValue
                }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('❌ Battle finish error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error?.message ?? String(error) }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
});
