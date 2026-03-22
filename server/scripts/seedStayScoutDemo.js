/**
 * Full StayScout demo: admin + tenant + landlord + 15 Tupi listings.
 * Run from repo root: node server/scripts/seedStayScoutDemo.js
 * Requires MONGO_URI in .env
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import mongoose from "mongoose";
import { nanoid } from "nanoid";
import connectDB from "../database/connectDB.js";
import RealEstate from "../models/RealEstate.js";
import OwnerUser from "../models/OwnerUser.js";
import TenantUser from "../models/TenantUser.js";
import AdminUser from "../models/AdminUser.js";
import SystemSettings from "../models/SystemSettings.js";

const DEMO = {
  admin: { email: "admin@stayscout.com", password: "admin123", firstName: "LGU", lastName: "Admin" },
  tenant: {
    email: "tenant@stayscout.com",
    password: "tenant123",
    firstName: "Demo",
    lastName: "Tenant",
    phoneNumber: "+639100000001",
    address: "SEAIT area",
    city: "Tupi",
    country: "Philippines",
    dateOfBirth: "2000-01-01",
    gender: "Other",
  },
  landlord: {
    email: "landlord@stayscout.com",
    password: "landlord123",
    firstName: "Demo",
    lastName: "Landlord",
    phoneNumber: "+639200000002",
    address: "Poblacion",
    city: "Tupi",
    country: "Philippines",
    dateOfBirth: "1990-01-01",
    gender: "Other",
  },
};

const LISTINGS = [
  { title: "Piang's Boarding House", address: "Prk. 2 Barangay Cebuano - Linan Rd", price: 1250, rating: 5.0, phone: "09756149495", lat: 6.3312, lng: 124.9508, distanceFromSEAIT: 0.8, walkMins: 10 },
  { title: "Kate's Boarding House", address: "Purok Cawayan Rd, Cebuano", price: 1200, rating: 4.5, phone: "09486543948", lat: 6.332, lng: 124.952, distanceFromSEAIT: 0.4, walkMins: 5 },
  { title: "BN Boarding House", address: "Purok 10-B Barangay", price: 1100, rating: 5.0, phone: "09198498864", lat: 6.333, lng: 124.953, distanceFromSEAIT: 1.1, walkMins: 14 },
  { title: "Bencel Boarding House", address: "Purok 10 Poblacion Tupi", price: 1300, rating: 3.5, phone: "09109797105", lat: 6.334, lng: 124.954, distanceFromSEAIT: 1.5, walkMins: 18 },
  { title: "YG's Boarding House", address: "Purok Cawayan Rd", price: 1150, rating: 5.0, phone: "09486543948", lat: 6.3315, lng: 124.9515, distanceFromSEAIT: 0.6, walkMins: 8 },
  { title: "Sim's Boarding House", address: "8XJ3+W43 Tupi", price: 1400, rating: 4.5, lat: 6.3325, lng: 124.9525, distanceFromSEAIT: 0.9, walkMins: 11 },
  { title: "Bajos Boarding House", address: "Purok 1 Poblacion", price: 1350, rating: 5.0, phone: "09560912350", lat: 6.3305, lng: 124.9495, distanceFromSEAIT: 0.7, walkMins: 9 },
  { title: "Don Pablo Boarding House", address: "Purok 2 Poblacion", price: 1450, rating: 5.0, phone: "09975543312", lat: 6.331, lng: 124.9502, distanceFromSEAIT: 0.5, walkMins: 6 },
  { title: "Primo's Boardinghouse", address: "Purok 7 Poblacion", price: 1500, rating: 4.0, lat: 6.33, lng: 124.949, distanceFromSEAIT: 1.2, walkMins: 15 },
  { title: "Dadodz Boarding House", address: "2 Purok-11D Road", price: 1600, rating: 5.0, phone: "09534274636", lat: 6.3335, lng: 124.9545, distanceFromSEAIT: 1.8, walkMins: 22 },
  { title: "Oliva Boarding House", address: "Crossing Rubber Prk 3", price: 1200, rating: 4.0, phone: "09394496844", lat: 6.3322, lng: 124.9518, distanceFromSEAIT: 0.3, walkMins: 4 },
  { title: "J&S Boarding House", address: "Purok 2 Tupi", price: 1300, rating: 4.2, phone: "09096883152", lat: 6.3318, lng: 124.9512, distanceFromSEAIT: 0.6, walkMins: 7 },
  { title: "Tupi Lola Boarding", address: "C.M. Recto St", price: 1100, rating: 4.3, phone: "09477477084", lat: 6.3328, lng: 124.9528, distanceFromSEAIT: 1.0, walkMins: 12 },
  { title: "Senador Boarding House", address: "8WXP+8MX Tupi", price: 1250, rating: 5.0, phone: "09082961514", lat: 6.3313, lng: 124.9505, distanceFromSEAIT: 0.4, walkMins: 5 },
  { title: "Chye's Boarding House", address: "Mapecon Purok 2 Lower", price: 1400, rating: 4.6, phone: "09356264430", lat: 6.3308, lng: 124.95, distanceFromSEAIT: 0.9, walkMins: 11 },
];

function sentimentFromRating(r) {
  return Math.min(1, Math.max(0, (Number(r) || 3) / 5));
}

async function upsertAdmin() {
  let a = await AdminUser.findOne({ email: DEMO.admin.email });
  if (a) {
    a.password = DEMO.admin.password;
    a.markModified("password");
    await a.save();
    console.log("Admin updated:", DEMO.admin.email);
  } else {
    await AdminUser.create(DEMO.admin);
    console.log("Admin created:", DEMO.admin.email);
  }
}

async function upsertTenant() {
  let t = await TenantUser.findOne({ email: DEMO.tenant.email });
  if (t) {
    t.password = DEMO.tenant.password;
    t.accountStatus = true;
    await t.save();
    console.log("Tenant updated:", DEMO.tenant.email);
  } else {
    await TenantUser.create({ ...DEMO.tenant, accountStatus: true });
    console.log("Tenant created:", DEMO.tenant.email);
  }
}

async function upsertLandlord() {
  let o = await OwnerUser.findOne({ email: DEMO.landlord.email });
  if (o) {
    o.password = DEMO.landlord.password;
    o.accountStatus = true;
    o.markModified("password");
    await o.save();
    console.log("Landlord updated:", DEMO.landlord.email);
    return o;
  }
  const created = await OwnerUser.create({ ...DEMO.landlord, accountStatus: true });
  console.log("Landlord created:", DEMO.landlord.email);
  return created;
}

function demoImagesForTitle(title) {
  const h = title.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return [
    `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80&sig=${h}`,
    `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80&sig=${h + 1}`,
    `https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80&sig=${h + 2}`,
  ];
}

async function seedListings(ownerId) {
  const titles = LISTINGS.map((x) => x.title);
  await RealEstate.deleteMany({ title: { $in: titles } });

  for (const row of LISTINGS) {
    const sent = sentimentFromRating(row.rating);
    await RealEstate.create({
      propertyId: nanoid(7),
      title: row.title,
      price: row.price,
      address: {
        streetName: row.address,
        city: "Tupi",
        state: "South Cotabato",
        country: "Philippines",
      },
      description: `Boarding house in Tupi near SEAIT. ${row.title}. Contact for availability.`,
      area: 200,
      floors: 2,
      facing: "North",
      category: "Room",
      status: true,
      lat: row.lat,
      lng: row.lng,
      location: "Tupi",
      rating: row.rating,
      sentimentScore: sent,
      distanceFromSEAIT: row.distanceFromSEAIT,
      walkMins: row.walkMins,
      listingStatus: "approved",
      contactPhone: row.phone || "",
      reviews: [
        {
          text: `Stay near SEAIT — good value at ₱${row.price}.`,
          sentiment: { joy: sent, anger: 0.05, satisfaction: sent },
        },
      ],
      realEstateImages: demoImagesForTitle(row.title),
      propertyOwner: ownerId,
    });
  }
  console.log(`Inserted ${LISTINGS.length} listings.`);
}

async function run() {
  await connectDB(process.env.MONGO_URI);

  await upsertAdmin();
  await upsertTenant();
  const landlord = await upsertLandlord();
  await seedListings(landlord._id);

  const s = await SystemSettings.findOne();
  if (!s) {
    await SystemSettings.create({ chatbotEnabled: true, heatmapEnabled: true });
    console.log("SystemSettings created.");
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
