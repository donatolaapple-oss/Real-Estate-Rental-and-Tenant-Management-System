import RealEstate from "../models/RealEstate.js";
import SystemSettings from "../models/SystemSettings.js";
import OwnerUser from "../models/OwnerUser.js";
import { NotFoundError } from "../request-errors/index.js";
import { SEAIT, distanceKm, walkMinutes } from "../utils/geoUtils.js";
import { listingImageUrlsFromProperty, LISTING_PLACEHOLDER_IMAGE } from "../utils/listingImages.js";

const MAP_CENTER = SEAIT;

function parseCompareQuery(text) {
  if (!text || typeof text !== "string") {
    return {
      budget: 5000,
      location: "",
      nearSeait: false,
      cheapest: false,
      maxDistanceKm: null,
    };
  }
  const cheapest = /\bcheapest\b|\blowest\s+price\b/i.test(text);

  let budget = 5000;
  const under = text.match(/under\s*(\d+)/i);
  const peso = text.match(/(\d{3,})\s*(?:php|peso|pesos)?/i);
  if (under) budget = parseInt(under[1], 10);
  else if (peso && !cheapest) budget = parseInt(peso[1], 10);
  else if (cheapest) budget = 100000000;

  let location = "";
  const near = text.match(/near\s+([a-zA-ZñÑ0-9\s]+?)(?:\s|$|,|\.)/i);
  if (near) location = near[1].trim();

  const nearSeait = /seait/i.test(text) || location.toLowerCase().includes("seait");
  if (/seait/i.test(text)) location = "SEAIT";

  let maxDistanceKm = null;
  if (nearSeait && under) {
    maxDistanceKm = 1;
  } else if (nearSeait && cheapest) {
    maxDistanceKm = 2;
  } else if (nearSeait) {
    maxDistanceKm = 15;
  }

  return { budget, location, nearSeait, cheapest, maxDistanceKm };
}

/** Spec: rating×0.6 + sentiment×0.4 (sentimentScore 0–1) */
function rankScore(rating, sentimentScore) {
  const r = Number(rating) || 0;
  const s = Number(sentimentScore) || 0;
  return r * 0.6 + s * 0.4;
}

function propDistanceKm(p) {
  if (p.distanceFromSEAIT != null && !Number.isNaN(Number(p.distanceFromSEAIT))) {
    return Number(p.distanceFromSEAIT);
  }
  if (p.lat == null || p.lng == null) return null;
  return distanceKm(SEAIT.lat, SEAIT.lng, p.lat, p.lng);
}

function propWalkMins(p, dKm) {
  if (p.walkMins != null && !Number.isNaN(Number(p.walkMins))) {
    return Math.round(Number(p.walkMins));
  }
  return walkMinutes(dKm);
}

function firstImageUrl(p) {
  const urls = listingImageUrlsFromProperty(p);
  return urls[0] || null;
}

function formatPropertyForMap(p) {
  const d = propDistanceKm(p);
  const w = propWalkMins(p, d);
  const owner = p.propertyOwner;
  const landlordId = owner && typeof owner === "object" ? owner._id : null;
  const city = p.address?.city || "";
  const areaLabel = (p.location || city || "").trim();
  return {
    _id: p._id,
    name: p.title,
    description: p.description?.slice(0, 280) || "",
    price: p.price,
    location: p.location || city || "",
    city: areaLabel,
    category: p.category || "",
    areaSqft: p.area,
    lat: p.lat,
    lng: p.lng,
    rating: p.rating,
    sentimentScore: p.sentimentScore,
    contactPhone: p.contactPhone || owner?.phoneNumber || "",
    slug: p.slug,
    distanceKm: d,
    walkMinutes: w,
    landlordId,
    imageUrl: firstImageUrl(p) || LISTING_PLACEHOLDER_IMAGE,
    imageUrls: listingImageUrlsFromProperty(p).length
      ? listingImageUrlsFromProperty(p)
      : [LISTING_PLACEHOLDER_IMAGE],
  };
}

/**
 * GET map — all approved listings with coordinates (no hardcoded cap)
 */
export const getMapProperties = async (req, res) => {
  const query = {
    status: true,
    listingStatus: "approved",
    lat: { $exists: true, $ne: null },
    lng: { $exists: true, $ne: null },
  };

  const list = await RealEstate.find(query)
    .populate({
      path: "propertyOwner",
      select: "firstName lastName phoneNumber email",
    })
    .sort({ sentimentScore: -1, rating: -1 })
    .lean();

  const formatted = list.map((p) => formatPropertyForMap(p));

  res.json({
    center: MAP_CENTER,
    seait: SEAIT,
    properties: formatted,
    count: formatted.length,
  });
};

export const getPropertyById = async (req, res) => {
  const { id } = req.params;
  const p = await RealEstate.findById(id).populate({
    path: "propertyOwner",
    select: "firstName lastName phoneNumber email _id slug",
  });
  if (!p) throw new NotFoundError("Property not found");
  if (p.listingStatus !== "approved" || !p.status) {
    throw new NotFoundError("Property not found");
  }

  p.viewCount = (p.viewCount || 0) + 1;
  await p.save();

  const images = listingImageUrlsFromProperty(p);
  const imageList = images.length ? images : [LISTING_PLACEHOLDER_IMAGE];

  const d = propDistanceKm(p);
  const w = propWalkMins(p, d);

  const pano =
    p.panorama ||
    (p.panoramaPath && String(p.panoramaPath).trim()
      ? String(p.panoramaPath).startsWith("http")
        ? p.panoramaPath
        : `/${String(p.panoramaPath).replace(/^\//, "")}`
      : null);

  res.json({
    property: {
      _id: p._id,
      name: p.title,
      price: p.price,
      location: p.location || p.address?.city,
      lat: p.lat,
      lng: p.lng,
      rating: p.rating,
      sentimentScore: p.sentimentScore,
      panorama: pano || p.panorama,
      panoramaPath: p.panoramaPath,
      images: imageList,
      coverImageUrl: imageList[0],
      reviews: p.reviews || [],
      description: p.description,
      contactPhone: p.contactPhone || p.propertyOwner?.phoneNumber || "",
      address: p.address,
      landlordId: p.propertyOwner?._id,
      landlordName: p.propertyOwner
        ? `${p.propertyOwner.firstName} ${p.propertyOwner.lastName}`
        : "",
      distanceKm: d,
      walkMinutes: w,
      seait: SEAIT,
    },
  });
};

export const postChatbotCompare = async (req, res) => {
  const settings = await SystemSettings.findOne().lean();
  if (settings && !settings.chatbotEnabled) {
    return res.status(403).json({ msg: "Chatbot is disabled by administrator" });
  }

  const { message } = req.body;
  const { budget, location, nearSeait, cheapest, maxDistanceKm } = parseCompareQuery(message);

  const query = {
    status: true,
    listingStatus: "approved",
    price: { $lte: budget },
  };

  if (location && location.length > 1 && location !== "SEAIT") {
    const rx = location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { location: { $regex: rx, $options: "i" } },
      { "address.city": { $regex: rx, $options: "i" } },
      { title: { $regex: rx, $options: "i" } },
      { description: { $regex: rx, $options: "i" } },
    ];
  }

  let props = await RealEstate.find(query).lean();

  if (nearSeait) {
    const cap = maxDistanceKm != null ? maxDistanceKm : 15;
    props = props.filter((p) => {
      const dist = propDistanceKm(p);
      return dist != null && dist <= cap;
    });
  }

  if (cheapest) {
    props.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else {
    props = props.map((p) => ({
      ...p,
      _rank: rankScore(p.rating, p.sentimentScore),
    }));
    props.sort((a, b) => b._rank - a._rank);
  }

  const top3 = props.slice(0, 3).map((p) => {
    const dKm = propDistanceKm(p);
    const wM = propWalkMins(p, dKm);
    const score = cheapest ? null : rankScore(p.rating, p.sentimentScore);
    return {
      _id: p._id,
      name: p.title,
      price: p.price,
      location: p.location || p.address?.city,
      rating: p.rating,
      sentimentScore: p.sentimentScore,
      score,
      distanceKm: dKm,
      walkMinutes: wM,
      slug: p.slug,
      category: p.category,
      area: p.area,
      features: `${p.category || "Room"} · ${p.area || "?"} sq ft · ${p.floors || 1} floor(s)`,
    };
  });

  const fmtLine = (row) => {
    if (!row) return "";
    const dist = row.distanceKm != null ? `${row.distanceKm}km` : "—";
    const walk = row.walkMinutes != null ? `${row.walkMinutes}min walk` : "—";
    const star = row.rating != null ? `${row.rating}⭐` : "";
    return `${row.name} (₱${row.price?.toLocaleString?.() ?? row.price}, ${dist}, ${walk}, ${star})`;
  };

  let recommendation =
    top3.length === 0
      ? `No boarding houses matched under ₱${budget}${
          location ? ` near ${location}` : ""
        }. Try raising your budget or broadening the area.`
      : `Best match: ${fmtLine(top3[0])}`;

  res.json({
    parsed: { budget, location, nearSeait, cheapest, maxDistanceKm },
    top3,
    recommendation,
  });
};

/**
 * Tenant analytics: sentiment by area, avg price, best areas
 */
export const getTenantAnalytics = async (req, res) => {
  const approved = await RealEstate.find({
    status: true,
    listingStatus: "approved",
    location: { $exists: true, $ne: "" },
  })
    .select("location price sentimentScore rating reviews")
    .lean();

  const byArea = {};
  for (const p of approved) {
    const area = p.location || "Unknown";
    if (!byArea[area]) {
      byArea[area] = { sumPrice: 0, sumSent: 0, n: 0 };
    }
    byArea[area].sumPrice += p.price || 0;
    byArea[area].sumSent += p.sentimentScore ?? 0.5;
    byArea[area].n += 1;
  }

  const areas = Object.entries(byArea).map(([name, v]) => ({
    area: name,
    avgPrice: v.n ? Math.round(v.sumPrice / v.n) : 0,
    avgSentiment: v.n ? Math.round((v.sumSent / v.n) * 100) / 100 : 0,
    listingCount: v.n,
  }));
  areas.sort((a, b) => b.avgSentiment - a.avgSentiment);

  const sentimentPerProperty = await RealEstate.find({
    status: true,
    listingStatus: "approved",
  })
    .select("title sentimentScore rating location")
    .limit(50)
    .lean();

  const landlordCount = await OwnerUser.countDocuments({ accountStatus: true });

  const topRated = await RealEstate.find({
    status: true,
    listingStatus: "approved",
  })
    .sort({ rating: -1, sentimentScore: -1 })
    .limit(8)
    .select("title price location rating sentimentScore")
    .lean();

  res.json({
    bestAreas: areas.slice(0, 8),
    byArea: areas,
    landlordCount,
    topRated: topRated.map((x) => ({
      name: x.title,
      price: x.price,
      location: x.location,
      rating: x.rating,
      sentimentScore: x.sentimentScore,
    })),
    sentimentPerProperty: sentimentPerProperty.map((p) => ({
      name: p.title,
      sentimentScore: p.sentimentScore,
      rating: p.rating,
      location: p.location,
    })),
  });
};
