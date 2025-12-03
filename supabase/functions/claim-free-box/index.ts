import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyToken } from 'https://deno.land/x/jose@v4.14.4/index.ts';

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
            const publicKey = await crypto.subtle.importKey(
                'spki',
                new TextEncoder().encode(CLERK_PEM_PUBLIC_KEY),
                { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
                false,
                ['verify']
            );

            const { payload } = await verifyToken(token, publicKey);
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

        // 3. Check if user has already claimed the free box
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('free_box_claimed, balance, id')
            .eq('id', clerkUserId)
            .single();

        if (userError) {
            console.error('Error fetching user:', userError);
            throw new Error('User not found');
        }

        if (user.free_box_claimed) {
            return new Response(JSON.stringify({ error: 'You have already claimed your free box' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        // 4. Get the Welcome Gift box items
        const { data: welcomeBox, error: boxError } = await supabaseAdmin
            .from('boxes')
            .select('*')
            .eq('id', 'welcome_gift')
            .single();

        if (boxError || !welcomeBox) {
            console.error('Error fetching welcome box:', boxError);
            throw new Error('Welcome box not found');
        }

        // 5. Select a random item from the box (weighted by odds)
        const items = welcomeBox.items;
        const randomValue = Math.random() * 100; // Random value between 0-100
        let cumulativeOdds = 0;
        let winningItem = items[0]; // Default to first item

        for (const item of items) {
            cumulativeOdds += item.odds;
            if (randomValue <= cumulativeOdds) {
                winningItem = item;
                break;
            }
        }

        // 6. Award the item and mark as claimed
        const newBalance = parseFloat(user.balance) + winningItem.value;

        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                balance: newBalance,
                free_box_claimed: true
            })
            .eq('id', clerkUserId)
            .eq('free_box_claimed', false);

        if (updateError) {
            console.error('Error updating user:', updateError);
            return new Response(JSON.stringify({ error: 'Failed to claim free box' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        return new Response(JSON.stringify({
            success: true,
            item: winningItem,
            newBalance,
            rollResult: {
                item: winningItem,
                serverSeed: 'welcome-bonus-seed',
                serverSeedHash: 'hashed-welcome-seed',
                nonce: 0,
                randomValue: randomValue / 100, // Normalize to 0-1 for frontend display
                block: { height: 840000, hash: '0000000000000000000mockhash' }
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
});
