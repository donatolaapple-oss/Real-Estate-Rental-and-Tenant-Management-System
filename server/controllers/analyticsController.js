import RealEstate from "../models/RealEstate.js";
import SystemSettings from "../models/SystemSettings.js";
/**
 * Heatmap points for tenant map — intensity = sentimentScore
 */
export const getHeatmapPoints = async (req, res) => {
  const settings = await SystemSettings.findOne().lean();
  if (settings && !settings.heatmapEnabled) {
    return res.status(403).json({ msg: "Heatmap is disabled" });
  }

  const query = {
    status: true,
    listingStatus: "approved",
    lat: { $exists: true, $ne: null },
    lng: { $exists: true, $ne: null },
  };

  const list = await RealEstate.find(query)
    .select("lat lng sentimentScore")
    .limit(50)
    .lean();

  const points = list.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    intensity: p.sentimentScore ?? 0.5,
  }));

  res.json(points);
};

/**
 * Landlord: heatmap-style report for own listings
 */
export const getLandlordHeatmapReport = async (req, res) => {
  const { userId } = req.user;
  const list = await RealEstate.find({
    propertyOwner: userId,
    lat: { $exists: true, $ne: null },
    lng: { $exists: true, $ne: null },
  })
    .select("title lat lng sentimentScore price")
    .lean();

  const points = list.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    intensity: p.sentimentScore ?? 0.5,
    name: p.title,
    price: p.price,
  }));

  res.json({ points, count: points.length });
};

/**
 * Landlord dashboard: views, ratings, per-listing stats
 */
export const getLandlordDashboardAnalytics = async (req, res) => {
  const { userId } = req.user;
  const listings = await RealEstate.find({ propertyOwner: userId })
    .select(
      "title slug price rating sentimentScore viewCount location lat lng listingStatus reviews"
    )
    .sort("-viewCount")
    .lean();

  const totalViews = listings.reduce((s, p) => s + (p.viewCount || 0), 0);
  const avgRating =
    listings.length > 0
      ? listings.reduce((s, p) => s + (p.rating || 0), 0) / listings.length
      : 0;
  const avgSentiment =
    listings.length > 0
      ? listings.reduce((s, p) => s + (p.sentimentScore ?? 0.5), 0) /
        listings.length
      : 0;

  const points = listings
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      lat: p.lat,
      lng: p.lng,
      intensity: p.sentimentScore ?? 0.5,
      name: p.title,
      price: p.price,
    }));

  res.json({
    summary: {
      listingCount: listings.length,
      totalViews,
      avgRating: Math.round(avgRating * 100) / 100,
      avgSentiment: Math.round(avgSentiment * 100) / 100,
    },
    listings: listings.map((p) => ({
      _id: p._id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      rating: p.rating,
      sentimentScore: p.sentimentScore,
      viewCount: p.viewCount || 0,
      reviewCount: p.reviews?.length || 0,
      listingStatus: p.listingStatus,
      location: p.location,
    })),
    heatmapPoints: points,
  });
};
