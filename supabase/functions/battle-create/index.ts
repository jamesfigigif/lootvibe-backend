import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { importSPKI, jwtVerify } from 'https://deno.land/x/jose@v4.14.4/index.ts';

const CLERK_PEM_PUBLIC_KEY = Deno.env.get('CLERK_PEM_PUBLIC_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Verify Clerk JWT
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Missing authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        let clerkUserId: string;

        try {
            const publicKey = await importSPKI(CLERK_PEM_PUBLIC_KEY, 'RS256');
            const { payload } = await jwtVerify(token, publicKey);
            clerkUserId = payload.sub as string;

            if (!clerkUserId) {
                throw new Error('No user ID in token');
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            throw new Error('Invalid token');
        }

        // 2. Initialize Supabase Admin Client
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // 3. Get request body
        const { boxId, playerCount, roundCount, mode } = await req.json();

        if (!boxId || !playerCount || !roundCount) {
            throw new Error('Missing required parameters');
        }

        // 4. Get box details
        const { data: box, error: boxError } = await supabaseAdmin
            .from('boxes')
            .select('*')
            .eq('id', boxId)
            .single();

        if (boxError || !box) {
            throw new Error('Box not found');
        }

        const cost = parseFloat(box.sale_price || box.price);

        // 5. Get user and check balance
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('id', clerkUserId)
            .single();

        if (userError || !user) {
            throw new Error('User not found');
        }

        const currentBalance = parseFloat(user.balance);
        if (currentBalance < cost) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Insufficient funds',
                required: cost,
                current: currentBalance
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        // 6. Deduct balance
        const newBalance = currentBalance - cost;
        const { error: balanceError } = await supabaseAdmin
            .from('users')
            .update({ balance: newBalance })
            .eq('id', clerkUserId);

        if (balanceError) {
            console.error('Error updating balance:', balanceError);
            throw new Error('Failed to deduct balance');
        }

        // 7. Create transaction record
        const battleType = playerCount === 2 ? '1v1' : playerCount === 4 ? '2v2' : '3v3';
        const { error: txError } = await supabaseAdmin
            .from('transactions')
            .insert({
                id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                user_id: clerkUserId,
                type: 'BET',
                amount: cost,
                description: `Battle creation: ${battleType}`,
                timestamp: Date.now()
            });

        if (txError) {
            console.error('Error creating transaction:', txError);
            // Continue anyway - balance already deducted
        }

        // 8. Get user details for battle
        const { data: fullUser } = await supabaseAdmin
            .from('users')
            .select('id, username, avatar, balance')
            .eq('id', clerkUserId)
            .single();

        // 9. Create battle
        const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const players = new Array(playerCount).fill(null);
        players[0] = {
            id: fullUser.id,
            username: fullUser.username,
            avatar: fullUser.avatar,
            balance: parseFloat(fullUser.balance)
        };

        const battle = {
            id: battleId,
            box_id: boxId,
            price: cost,
            player_count: playerCount,
            round_count: roundCount,
            mode: mode || 'STANDARD',
            status: 'WAITING',
            players: JSON.stringify(players)
        };

        const { data: createdBattle, error: battleError } = await supabaseAdmin
            .from('battles')
            .insert(battle)
            .select()
            .single();

        if (battleError) {
            console.error('Error creating battle:', battleError);
            throw new Error('Failed to create battle');
        }

        console.log(`✅ Battle created: ${battleId} by user ${clerkUserId}`);

        return new Response(JSON.stringify({
            success: true,
            battle: {
                ...createdBattle,
                players: JSON.parse(createdBattle.players)
            },
            newBalance
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
});
