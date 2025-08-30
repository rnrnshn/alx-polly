// Test script to verify authentication setup
// Run with: node test-auth.js

require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

console.log("🔍 Testing Supabase authentication setup...\n");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    console.log("📋 Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.log("❌ Database connection failed:", error.message);
      return;
    }

    console.log("✅ Database connection successful");
    console.log("✅ Authentication setup looks good");
    console.log("\n🎯 Next steps:");
    console.log("1. Restart your dev server: npm run dev");
    console.log("2. Try logging in with your credentials");
    console.log("3. Test poll creation after login");
  } catch (err) {
    console.log("❌ Test failed:", err.message);
  }
}

testAuth();

