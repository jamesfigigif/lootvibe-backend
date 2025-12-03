const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Generate a secure random password
function generateSecurePassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = password.length; i < 20; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function createAdminUser() {
    // Use the Supabase URL from .env.local
    const supabaseUrl = 'https://hpflcuyxmwzrknxjgavd.supabase.co';
    
    // Try with service role key (bypasses RLS) - you'll need to get this from Supabase dashboard
    // For now, try with anon key and see if RLS allows admin_users inserts
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZmxjdXl4bXd6cmtueGpnYXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTI5NzMsImV4cCI6MjA4MDA4ODk3M30.BEa5PXEfBd1A2yaeRGr287UCdQ2YHGWtWjYGxvfFhjk';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const email = 'admin@lootvibe.com';
    const password = generateSecurePassword();

    console.log('🔐 Generating secure admin account...\n');

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate admin ID
    const adminId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🆔 Admin ID:', adminId);
    console.log('\n⏳ Creating admin user in Supabase...\n');

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .single();

    let result;
    if (existingAdmin) {
        // Update existing admin
        const { data, error } = await supabase
            .from('admin_users')
            .update({
                password_hash: passwordHash,
                role: 'SUPER_ADMIN',
                updated_at: new Date().toISOString()
            })
            .eq('email', email)
            .select();

        if (error) {
            console.error('❌ Error updating admin user:', error);
            if (error.code === 'PGRST301' || error.message.includes('permission')) {
                console.error('\n⚠️  Permission denied. You need to use the Supabase SERVICE ROLE KEY.');
                console.error('   Get it from: Supabase Dashboard → Project Settings → API');
                console.error('   Then set: export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
                console.error('   Or add it to your .env.local file\n');
            }
            process.exit(1);
        }
        console.log('✅ Admin user password updated successfully!\n');
    } else {
        // Insert new admin
        const { data, error } = await supabase
            .from('admin_users')
            .insert({
                id: adminId,
                email: email,
                password_hash: passwordHash,
                role: 'SUPER_ADMIN',
                two_fa_enabled: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select();

        if (error) {
            console.error('❌ Error creating admin user:', error);
            if (error.code === 'PGRST301' || error.message.includes('permission')) {
                console.error('\n⚠️  Permission denied. You need to use the Supabase SERVICE ROLE KEY.');
                console.error('   Get it from: Supabase Dashboard → Project Settings → API');
                console.error('   Then set: export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
                console.error('   Or add it to your .env.local file\n');
            }
            process.exit(1);
        }
        console.log('✅ Admin user created successfully!\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 LOGIN CREDENTIALS - SAVE THIS INFORMATION!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ' + email);
    console.log('Password: ' + password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Save this password securely!');
    console.log('   You will need it to log into the admin panel at lootvibe.com/admin\n');
}

createAdminUser().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
