// Simple script to check if environment variables are loaded
// Run with: node check-env.js

require("dotenv").config({ path: ".env.local" });

const requiredVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

console.log("🔍 Checking environment variables...\n");

let allGood = true;

Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${key}: MISSING`);
    allGood = false;
  }
});

console.log(
  "\n" +
    (allGood
      ? "🎉 All environment variables are set!"
      : "⚠️  Some environment variables are missing.")
);

if (!allGood) {
  console.log("\n📝 To fix this:");
  console.log("1. Copy env.template to .env.local");
  console.log("2. Fill in your actual Supabase values");
  console.log("3. Restart your development server");
}

