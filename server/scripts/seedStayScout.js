/**
 * Seeds up to 10 StayScout boarding houses in Tupi (lat/lng near center).
 * Run: node server/scripts/seedStayScout.js
 * Requires MONGO_URI and optional SEED_LANDLORD_EMAIL (existing OwnerUser email).
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../database/connectDB.js";
import RealEstate from "../models/RealEstate.js";
import OwnerUser from "../models/OwnerUser.js";
import SystemSettings from "../models/SystemSettings.js";
import { nanoid } from "nanoid";

const CENTER = { lat: 6.331, lng: 124.951 };

const BOARDING_HOUSES = [
  { title: "Cebuano Corner Lodge", location: "Cebuano", price: 3500 },
  { title: "Tupi Heights Boarding", location: "Poblacion", price: 4200 },
  { title: "Mango Street Dorm", location: "Cebuano", price: 4800 },
  { title: "South Cotabato Stay Hub", location: "San Roque", price: 3900 },
  { title: "Highland View Rooms", location: "Crossing Rubber", price: 5200 },
  { title: "Green Valley Boarding", location: "Cebuano", price: 4500 },
  { title: "Riverside Budget Inn", location: "Poblacion", price: 3300 },
  { title: "Sunrise Student Lodge", location: "Cebuano", price: 4100 },
  { title: "Mountain View Dormitory", location: "Linan", price: 4700 },
  { title: "Central Plaza Rooms", location: "Poblacion", price: 3600 },
];

function jitter(i) {
  return CENTER.lat + (i % 3) * 0.004 - 0.004 + (i * 0.0017) % 0.003;
}
function jitterLng(i) {
  return CENTER.lng + (i % 2) * 0.003 - 0.002 + (i * 0.0021) % 0.002;
}

async function run() {
  await connectDB(process.env.MONGO_URI);

  let landlord = null;
  if (process.env.SEED_LANDLORD_EMAIL) {
    landlord = await OwnerUser.findOne({ email: process.env.SEED_LANDLORD_EMAIL });
  }
  if (!landlord) {
    landlord = await OwnerUser.findOne();
  }
  if (!landlord) {
    console.error(
      "No OwnerUser found. Register a landlord first or set SEED_LANDLORD_EMAIL."
    );
    process.exit(1);
  }

  let count = await RealEstate.countDocuments({
    lat: { $exists: true },
    listingStatus: "approved",
  });

  const need = Math.max(0, 10 - count);
  if (need === 0) {
    console.log("Already have enough geocoded approved listings.");
  } else {
    let created = 0;
    for (let i = 0; i < BOARDING_HOUSES.length && created < need; i++) {
      const bh = BOARDING_HOUSES[i];
      const exists = await RealEstate.findOne({ title: bh.title });
      if (exists) continue;

      const sentimentScore = 0.45 + (i % 5) * 0.1;
      const rating = 3.5 + (i % 4) * 0.4;

      await RealEstate.create({
        propertyId: nanoid(7),
        title: bh.title,
        price: bh.price,
        address: {
          streetName: `${bh.location} Street`,
          city: "Tupi",
          state: "South Cotabato",
          country: "Philippines",
        },
        description: `Boarding house in ${bh.location}, Tupi. Quiet rooms, shared kitchen, Wi‑Fi.`,
        area: 120 + i * 5,
        floors: 2,
        facing: "North",
        category: "Room",
        status: true,
        lat: jitter(i),
        lng: jitterLng(i),
        location: bh.location,
        rating,
        sentimentScore,
        listingStatus: "approved",
        contactPhone: "+63 900 000 " + String(1000 + i),
        panorama: "",
        reviews: [
          {
            text: "Clean and affordable stay near the area.",
            sentiment: { joy: 0.75, anger: 0.05, satisfaction: 0.82 },
          },
        ],
        realEstateImages: [],
        propertyOwner: landlord._id,
      });
      created++;
    }
    console.log(`Created ${created} StayScout listings (target gap was ${need}).`);
  }

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
