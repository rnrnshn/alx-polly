// Simple test to check if environment variables are loaded
// Run with: node test-env.js

require("dotenv").config({ path: ".env.local" });

console.log("🔍 Testing environment variables...\n");

const vars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

let allGood = true;

Object.entries(vars).forEach(([key, value]) => {
  if (value) {
    // Check if it looks like a valid value
    if (key.includes("URL") && value.startsWith("https://")) {
      console.log(`✅ ${key}: Valid URL format`);
    } else if (key.includes("KEY") && value.startsWith("eyJ")) {
      console.log(`✅ ${key}: Valid JWT format`);
    } else {
      console.log(`⚠️  ${key}: Has value but format unclear`);
    }
  } else {
    console.log(`❌ ${key}: MISSING`);
    allGood = false;
  }
});

console.log(
  "\n" +
    (allGood
      ? "🎉 Environment variables look good!"
      : "⚠️  Some variables are missing.")
);

if (allGood) {
  console.log(
    "\n✅ You can now restart your dev server and test poll creation!"
  );
} else {
  console.log("\n❌ Please check your .env.local file and try again.");
}

