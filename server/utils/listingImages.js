/**
 * Normalize Cloudinary / string image entries from RealEstate.realEstateImages
 */
export function normalizeListingImageUrl(raw) {
  if (!raw) return null;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return null;
    if (s.startsWith("http")) return s;
    return s;
  }
  return raw?.url || raw?.secure_url || null;
}

export function listingImageUrlsFromProperty(p) {
  const imgs = p?.realEstateImages || [];
  return imgs.map(normalizeListingImageUrl).filter(Boolean);
}

/** Placeholder when a listing has no photos yet */
export const LISTING_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";
