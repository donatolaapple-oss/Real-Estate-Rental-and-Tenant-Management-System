import OwnerUser from "../models/OwnerUser.js";
import TenantUser from "../models/TenantUser.js";
import RealEstate from "../models/RealEstate.js";
import SystemSettings from "../models/SystemSettings.js";
import { NotFoundError, BadRequestError } from "../request-errors/index.js";
import { SEAIT } from "../utils/geoUtils.js";

async function getOrCreateSettings() {
  let s = await SystemSettings.findOne();
  if (!s) s = await SystemSettings.create({});
  return s;
}

export const listAllUsers = async (req, res) => {
  const tenants = await TenantUser.find()
    .select("-password -accountVerificationToken")
    .lean();
  const landlords = await OwnerUser.find()
    .select("-password -accountVerificationToken")
    .lean();

  res.json({
    tenants: tenants.map((u) => ({ ...u, role: "tenant" })),
    landlords: landlords.map((u) => ({ ...u, role: "landlord" })),
  });
};

export const setUserActive = async (req, res) => {
  const { role, id } = req.params;
  const { active } = req.body;
  if (typeof active !== "boolean") {
    throw new BadRequestError("active boolean required");
  }
  if (role === "tenant") {
    const u = await TenantUser.findById(id);
    if (!u) throw new NotFoundError("User not found");
    u.accountStatus = active;
    await u.save();
  } else if (role === "landlord") {
    const u = await OwnerUser.findById(id);
    if (!u) throw new NotFoundError("User not found");
    u.accountStatus = active;
    await u.save();
  } else {
    throw new BadRequestError("Invalid role");
  }
  res.json({ success: true });
};

export const listPendingListings = async (req, res) => {
  const pending = await RealEstate.find({ listingStatus: "pending" })
    .populate("propertyOwner", "firstName lastName email phoneNumber")
    .sort("-createdAt")
    .lean();
  res.json({ listings: pending });
};

export const setListingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    throw new BadRequestError("Invalid status");
  }
  const p = await RealEstate.findById(id);
  if (!p) throw new NotFoundError("Listing not found");
  p.listingStatus = status;
  await p.save();
  res.json({ listing: p });
};

export const getSystemSettings = async (req, res) => {
  const s = await getOrCreateSettings();
  res.json(s);
};

export const patchSystemSettings = async (req, res) => {
  const { chatbotEnabled, heatmapEnabled } = req.body;
  const s = await getOrCreateSettings();
  if (typeof chatbotEnabled === "boolean") s.chatbotEnabled = chatbotEnabled;
  if (typeof heatmapEnabled === "boolean") s.heatmapEnabled = heatmapEnabled;
  await s.save();
  res.json(s);
};

/**
 * Admin dashboard: sentiment distribution, listings, user growth, heatmap, popular
 */
export const getDashboardAnalytics = async (req, res) => {
  const totalTenants = await TenantUser.countDocuments();
  const totalLandlords = await OwnerUser.countDocuments();
  const approvedListings = await RealEstate.countDocuments({
    listingStatus: "approved",
  });
  const pendingListings = await RealEstate.countDocuments({
    listingStatus: "pending",
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newTenants = await TenantUser.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const newLandlords = await OwnerUser.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const props = await RealEstate.find({ listingStatus: "approved" })
    .select("reviews sentimentScore viewCount title price lat lng")
    .lean();

  let joySum = 0;
  let angerSum = 0;
  let satSum = 0;
  let reviewCount = 0;
  const sentimentBuckets = { low: 0, neutral: 0, high: 0 };

  for (const p of props) {
    const s = p.sentimentScore ?? 0.5;
    if (s < 0.33) sentimentBuckets.low++;
    else if (s < 0.66) sentimentBuckets.neutral++;
    else sentimentBuckets.high++;
    for (const r of p.reviews || []) {
      if (r.sentiment) {
        joySum += r.sentiment.joy ?? 0;
        angerSum += r.sentiment.anger ?? 0;
        satSum += r.sentiment.satisfaction ?? 0;
        reviewCount++;
      }
    }
  }

  const overallSentiment = {
    joy: reviewCount ? Math.round((joySum / reviewCount) * 100) / 100 : 0,
    anger: reviewCount ? Math.round((angerSum / reviewCount) * 100) / 100 : 0,
    satisfaction: reviewCount ? Math.round((satSum / reviewCount) * 100) / 100 : 0,
    distribution: sentimentBuckets,
  };

  const popular = await RealEstate.find({ listingStatus: "approved" })
    .sort({ viewCount: -1 })
    .limit(8)
    .select("title viewCount sentimentScore price location")
    .lean();

  const heatmapPoints = await RealEstate.find({
    listingStatus: "approved",
    lat: { $exists: true, $ne: null },
    lng: { $exists: true, $ne: null },
  })
    .select("lat lng sentimentScore price title")
    .limit(80)
    .lean();

  const listingsPerAreaAgg = await RealEstate.aggregate([
    { $match: { listingStatus: "approved" } },
    {
      $addFields: {
        areaLabel: {
          $ifNull: ["$location", { $ifNull: ["$address.city", "Other"] }],
        },
      },
    },
    { $group: { _id: "$areaLabel", count: { $sum: 1 } } },
    { $match: { _id: { $nin: [null, ""] } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  const listingsPerArea = listingsPerAreaAgg.map((x) => ({
    area: x._id || "Unknown",
    count: x.count,
  }));

  const now = new Date();
  const monthBuckets = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      0,
      23,
      59,
      59,
      999
    );
    monthBuckets.push({
      month: start.toLocaleString("en", { month: "short" }),
      start,
      end,
    });
  }

  const userGrowth = await Promise.all(
    monthBuckets.map(async ({ month, start, end }) => {
      const [tc, lc] = await Promise.all([
        TenantUser.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        OwnerUser.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      ]);
      return { month, newUsers: tc + lc };
    })
  );

  res.json({
    users: {
      totalTenants,
      totalLandlords,
      newTenants30d: newTenants,
      newLandlords30d: newLandlords,
    },
    listings: {
      approved: approvedListings,
      pending: pendingListings,
    },
    overallSentiment,
    popularProperties: popular,
    heatmapOverview: heatmapPoints.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      intensity: p.sentimentScore ?? 0.5,
      price: p.price,
      name: p.title,
    })),
    listingsPerArea,
    userGrowth,
    seait: SEAIT,
  });
};
