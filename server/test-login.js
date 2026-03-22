// Test login endpoint
const testLogin = async (email, password, role) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        role
      })
    });

    const result = await response.json();
    console.log(`\n🔍=== LOGIN TEST FOR ${role.toUpperCase()} ===`);
    console.log('🔍 EMAIL:', email);
    console.log('🔍 PASSWORD LENGTH:', password.length);
    console.log('🔍 RESPONSE STATUS:', response.status);
    console.log('🔍 RESPONSE:', result);
    
    if (response.ok) {
      console.log('✅ LOGIN SUCCESSFUL!');
    } else {
      console.log('❌ LOGIN FAILED:', result.msg || result.message);
    }
    console.log('🔍===================');
    
    return response.ok;
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
};

// Test both logins
(async () => {
  console.log('Testing login endpoints...');
  
  await testLogin('test_owner_user@property.com', 'secret', 'owner');
  await testLogin('test_tenant_user@property.com', 'secret', 'tenant');
})();
