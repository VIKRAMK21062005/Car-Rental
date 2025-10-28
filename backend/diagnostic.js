// backend/check-startup.js - Run BEFORE starting server
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 PRE-START CHECKLIST\n');
console.log('═'.repeat(60));

let allGood = true;

// 1. Check .env exists
console.log('\n📄 Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file NOT FOUND!');
  console.log('   Create it by running:');
  console.log('   cp .env.example .env');
  allGood = false;
} else {
  console.log('✅ .env file exists');
  
  // Load env
  dotenv.config();
  
  // 2. Check required variables
  console.log('\n🔐 Checking required environment variables...');
  
  const required = {
    'JWT_SECRET': process.env.JWT_SECRET,
    'MONGODB_URI': process.env.MONGODB_URI,
    'ADMIN_SECRET_KEY': process.env.ADMIN_SECRET_KEY,
    'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
    'PORT': process.env.PORT || '5000'
  };
  
  for (const [key, value] of Object.entries(required)) {
    if (value && value.trim() !== '') {
      console.log(`✅ ${key}: configured`);
    } else {
      console.log(`❌ ${key}: MISSING or EMPTY`);
      allGood = false;
    }
  }
}

// 3. Check package.json
console.log('\n📦 Checking package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.log('❌ package.json NOT FOUND!');
  allGood = false;
} else {
  console.log('✅ package.json exists');
}

// 4. Check node_modules
console.log('\n📚 Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ node_modules NOT FOUND!');
  console.log('   Run: npm install');
  allGood = false;
} else {
  console.log('✅ node_modules exists');
}

// 5. Check critical files
console.log('\n📁 Checking critical files...');
const criticalFiles = [
  'server.js',
  'config/db.js',
  'routes/authRoutes.js',
  'controllers/authController.js',
  'models/User.js'
];

for (const file of criticalFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
}

// 6. Show Admin Secret Key
if (process.env.ADMIN_SECRET_KEY) {
  console.log('\n🔑 Admin Secret Key (copy this for frontend):');
  console.log('═'.repeat(60));
  console.log(`\n   ${process.env.ADMIN_SECRET_KEY}\n`);
  console.log('═'.repeat(60));
  console.log('Use this when registering as admin in the frontend!');
}

// Final verdict
console.log('\n\n📊 FINAL CHECK:');
console.log('═'.repeat(60));

if (allGood) {
  console.log('\n✅ ALL CHECKS PASSED!');
  console.log('\n🚀 Ready to start server:');
  console.log('   npm start\n');
} else {
  console.log('\n❌ ISSUES FOUND! Fix them before starting server.\n');
  console.log('Quick fixes:');
  console.log('   1. Create .env: cp .env.example .env');
  console.log('   2. Install deps: npm install');
  console.log('   3. Check file paths\n');
  process.exit(1);
}

console.log('═'.repeat(60) + '\n');