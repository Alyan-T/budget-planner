import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const email = 'admin@budgetplanner.local';
  const password = 'AdminPassword123!';

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Note: If email confirmation is enabled in your Supabase project settings, you might need to confirm the email or disable "Enable Email Confirmations" in the Supabase Dashboard (Authentication -> Providers -> Email).');
  }
}

createAdmin();
