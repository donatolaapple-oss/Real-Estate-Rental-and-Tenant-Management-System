use realestate

// DELETE ALL existing demo users
db.ownerusers.deleteMany({})
db.tenantusers.deleteMany({})

// OWNER - test_owner_user@property.com / secret
db.ownerusers.insertOne({
  email: "test_owner_user@property.com",
  password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  role: "owner",
  accountStatus: true,
  firstName: "Test",
  lastName: "Owner",
  address: "123 Test St",
  city: "Test City",
  country: "Test Country",
  phoneNumber: "+1234567890",
  dateOfBirth: "1990-01-01",
  gender: "Male",
  createdAt: new Date()
})

// TENANT - demo@tenant.com / secret  
db.tenantusers.insertOne({
  email: "test_tenant_user@property.com",
  password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", 
  role: "tenant",
  accountStatus: true,
  firstName: "Demo",
  lastName: "Tenant",
  address: "456 Demo Ave",
  city: "Demo City",
  country: "Demo Country",
  phoneNumber: "+0987654321",
  dateOfBirth: "1995-05-05",
  gender: "Female",
  createdAt: new Date()
})

// VERIFY
print("=== OWNER USERS ===")
db.ownerusers.find({email: {$in: ["test_owner_user@property.com"]}}).forEach(printjson)
print("=== TENANT USERS ===")
db.tenantusers.find({email: {$in: ["test_tenant_user@property.com"]}}).forEach(printjson)
