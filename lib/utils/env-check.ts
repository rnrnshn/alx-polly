export function checkEnvironmentVariables() {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars);
    console.error('Please create a .env.local file with the following variables:');
    console.error('');
    missingVars.forEach(varName => {
      console.error(`${varName}=your_value_here`);
    });
    console.error('');
    console.error('Get these values from your Supabase project dashboard.');
    return false;
  }

  console.log('✅ All environment variables are set');
  return true;
}

