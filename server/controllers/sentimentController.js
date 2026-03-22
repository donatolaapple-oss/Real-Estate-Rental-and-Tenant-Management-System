import RealEstate from "../models/RealEstate.js";
import { NotFoundError, BadRequestError } from "../request-errors/index.js";

const POS = new Set(
  "good great love excellent happy satisfied clean safe nice best amazing wonderful".split(" ")
);
const NEG = new Set(
  "bad hate terrible angry dirty noisy worst awful poor worst".split(" ")
);

function analyzeText(text) {
  const lower = text.toLowerCase().replace(/[^\w\s]/g, " ");
  const words = lower.split(/\s+/).filter(Boolean);
  let pos = 0;
  let neg = 0;
  for (const w of words) {
    if (POS.has(w)) pos += 1;
    if (NEG.has(w)) neg += 1;
  }
  const total = pos + neg + 1;
  const joy = Math.min(1, 0.3 + (pos / total) * 0.7);
  const anger = Math.min(1, (neg / total) * 0.9);
  const satisfaction = Math.min(1, Math.max(0, joy - anger * 0.5));
  const sentimentScore = Math.min(1, Math.max(0, satisfaction * 0.6 + joy * 0.4));
  return {
    joy: Math.round(joy * 100) / 100,
    anger: Math.round(anger * 100) / 100,
    satisfaction: Math.round(satisfaction * 100) / 100,
    sentimentScore: Math.round(sentimentScore * 100) / 100,
  };
}

function aggregatePropertySentiment(reviews) {
  if (!reviews?.length) return 0.5;
  const scores = reviews.map((r) => {
    if (r.sentiment?.satisfaction != null) {
      return (
        (r.sentiment.joy || 0) * 0.2 +
        (r.sentiment.satisfaction || 0) * 0.6 -
        (r.sentiment.anger || 0) * 0.2
      );
    }
    return r.sentimentScore || 0.5;
  });
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.min(1, Math.max(0, avg));
}

/**
 * POST review — updates reviews[] and sentimentScore on property
 */
export const postReview = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text || !String(text).trim()) {
    throw new BadRequestError("Review text is required");
  }

  const property = await RealEstate.findById(id);
  if (!property) throw new NotFoundError("Property not found");

  const sentiment = analyzeText(text);
  property.reviews = property.reviews || [];
  property.reviews.push({
    text: String(text).trim(),
    sentiment: {
      joy: sentiment.joy,
      anger: sentiment.anger,
      satisfaction: sentiment.satisfaction,
    },
  });
  property.sentimentScore = aggregatePropertySentiment(property.reviews);

  await property.save();

  res.status(201).json({
    review: property.reviews[property.reviews.length - 1],
    sentimentScore: property.sentimentScore,
    aggregates: {
      joy: sentiment.joy,
      anger: sentiment.anger,
      satisfaction: sentiment.satisfaction,
    },
  });
};

/**
 * GET property sentiment summary for charts
 */
export const getPropertySentiment = async (req, res) => {
  const { id } = req.params;
  const property = await RealEstate.findById(id).select("reviews sentimentScore title");
  if (!property) throw new NotFoundError("Property not found");

  let joy = 0;
  let anger = 0;
  let satisfaction = 0;
  const n = property.reviews?.length || 0;
  if (n) {
    for (const r of property.reviews) {
      joy += r.sentiment?.joy ?? 0;
      anger += r.sentiment?.anger ?? 0;
      satisfaction += r.sentiment?.satisfaction ?? 0;
    }
    joy /= n;
    anger /= n;
    satisfaction /= n;
  } else {
    joy = 0.5;
    anger = 0.1;
    satisfaction = 0.5;
  }

  res.json({
    joy: Math.round(joy * 100) / 100,
    anger: Math.round(anger * 100) / 100,
    satisfaction: Math.round(satisfaction * 100) / 100,
    sentimentScore: property.sentimentScore ?? 0.5,
  });
};
