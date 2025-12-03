const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase connection details
const supabaseUrl = 'https://cbjdasfnwzizfphnwxfd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiamRhc2Zud3ppemZwaG53eGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzNTk1NzQsImV4cCI6MjA0NzkzNTU3NH0.9bLYe3Pu2gJGPqNqJYnFdqhLYLZDqLZhqLZhqLZhqLY';

// Generate a secure random password
function generateSecurePassword() {
    // Generate a 20-character password with uppercase, lowercase, numbers, and symbols
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < 20; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function createAdminUser() {
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

    // Try to insert/update
    const { data, error } = await supabase
        .from('admin_users')
        .upsert({
            id: adminId,
            email: email,
            password_hash: passwordHash,
            role: 'SUPER_ADMIN',
            two_fa_enabled: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'email'
        });

    if (error) {
        console.error('❌ Error creating admin user:', error);
        console.error('\nDetails:', JSON.stringify(error, null, 2));
        
        // If it's a permission error, try using service role key
        if (error.message && error.message.includes('permission') || error.code === 'PGRST301') {
            console.log('\n⚠️  Permission denied. You may need to use the service role key.');
            console.log('Please check your Supabase RLS policies or use the service role key.');
        }
        process.exit(1);
    } else {
        console.log('✅ Admin user created/updated successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 LOGIN CREDENTIALS - SAVE THIS INFORMATION!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:    ' + email);
        console.log('Password: ' + password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('⚠️  IMPORTANT: Save this password securely!');
        console.log('   You will need it to log into the admin panel.\n');
    }
}

createAdminUser().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

