const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config();

// Create Supabase admin client with service role key
const supabase = createClient(
    'https://cbjdasfnwzizfphnwxfd.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
    console.log('📦 Reading migration file...');

    const migrationPath = path.join(__dirname, '../supabase/migrations/20251203000007_withdrawal_system_enhancements.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Applying migration to database...');
    console.log('Migration size:', sql.length, 'bytes');

    try {
        // Split the SQL into statements (basic split on semicolons)
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Found ${statements.length} SQL statements`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';';

            // Skip comments
            if (statement.startsWith('--')) continue;

            console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);

            const { data, error } = await supabase.rpc('exec_sql', {
                sql_query: statement
            });

            if (error) {
                console.error('❌ Error:', error);
                // Continue with other statements
            } else {
                console.log('✅ Success');
            }
        }

        console.log('\n✨ Migration completed!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

applyMigration();
