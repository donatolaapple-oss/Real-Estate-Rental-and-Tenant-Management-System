import bcrypt from 'bcryptjs';

async function testPasswordHash() {
  const password = 'secret';
  
  // Test different hash methods
  console.log('Testing password hashing...');
  
  // Method 1: Standard bcrypt
  const hash1 = await bcrypt.hash(password, 10);
  console.log('Hash1 (bcrypt.genSalt + bcrypt.hash):', hash1);
  const match1 = await bcrypt.compare(password, hash1);
  console.log('Match1:', match1);
  
  // Method 2: Direct hash
  const hash2 = await bcrypt.hash(password, 10);
  console.log('Hash2 (bcrypt.hash):', hash2);
  const match2 = await bcrypt.compare(password, hash2);
  console.log('Match2:', match2);
  
  // Test the hash we used in create-users.js
  const testHash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  const matchTest = await bcrypt.compare(password, testHash);
  console.log('Match with provided hash:', matchTest);
  
  // Create a new hash like the models would
  const salt = await bcrypt.genSalt(10);
  const modelHash = await bcrypt.hash(password, salt);
  console.log('Model hash:', modelHash);
  const matchModel = await bcrypt.compare(password, modelHash);
  console.log('Model hash match:', matchModel);
}

testPasswordHash();
