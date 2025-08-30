// Verification script to check if everything is set up correctly
// Run with: node verify-setup.js

require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

console.log("🔍 Verifying Supabase setup...\n");

// Check environment variables
const requiredVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

console.log("📋 Environment Variables:");
let envOk = true;
Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`❌ ${key}: MISSING`);
    envOk = false;
  }
});

if (!envOk) {
  console.log("\n❌ Environment variables are not properly set.");
  console.log("Please check your .env.local file and restart the script.");
  process.exit(1);
}

console.log("\n🔗 Testing Supabase connection...");

// Test Supabase connection
try {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Test a simple query
  const { data, error } = await supabase.from("polls").select("count").limit(1);

  if (error) {
    console.log("❌ Supabase connection failed:");
    console.log("   Error:", error.message);
    console.log("\nPossible issues:");
    console.log("1. Database schema not applied");
    console.log("2. Incorrect credentials");
    console.log("3. Network connectivity issues");
  } else {
    console.log("✅ Supabase connection successful!");
    console.log("✅ Database is accessible");
  }
} catch (err) {
  console.log("❌ Failed to connect to Supabase:");
  console.log("   Error:", err.message);
}

console.log("\n🎯 Next steps:");
console.log("1. If all checks pass, restart your dev server: npm run dev");
console.log("2. Try creating a poll in your app");
console.log("3. Check the browser console for any errors");

