import mongoose from "mongoose";
import slug from "mongoose-slug-generator";
mongoose.plugin(slug);

const RealEstateSchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: [true, "Please provide a property ID"],
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title for the property"],
      trim: true,
      maxLength: [100, "Title cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      slug: "title",
      slug_padding_size: 4,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide a price for the property"],
      min: [1000, "Price cannot be less than 1000"],
      max: [100000000, "Price cannot be more than 100000000"],
    },
    address: {
      streetName: {
        type: String,
        required: [
          true,
          "Please provide a street name or landmark for the property",
        ],
      },
      city: {
        type: String,
        required: [true, "Please provide the city of the property"],
      },
      state: {
        type: String,
      },
      country: {
        type: String,
        required: [true, "Please provide the country of the property"],
      },
    },
    description: {
      type: String,
      required: [true, "Please provide a description for the property"],
      trim: true,
      maxLength: [3000, "Description cannot be more than 3000 characters"],
    },
    area: {
      type: Number,
      required: [true, "Please provide the area of the property"],
      min: [100, "Area cannot be less than 100 sq.feet"],
      max: [200000, "Area cannot be more than 200000 sq.feet"],
    },
    floors: {
      type: Number,
      required: [true, "Please provide the number of floors in the property"],
      min: [1, "Number of floors cannot be less than 1"],
      max: [200, "Number of floors cannot be more than 200"],
    },

    facing: {
      type: String,
      required: [true, "Please provide the facing direction of the property"],
      enum: {
        values: [
          "North",
          "South",
          "East",
          "West",
          "North-East",
          "North-West",
          "South-East",
          "South-West",
        ],
        message: "{VALUE} is not in the facing list",
      },
    },

    category: {
      type: String,
      required: [true, "Please provide a category for the property"],
      enum: {
        values: ["House", "Apartment", "Room", "Shop Space", "Office Space"],
        message: "{VALUE} is not in the category list",
      },
    },

    status: {
      type: Boolean,
      default: true,
    },

    /** StayScout: map & discovery */
    lat: { type: Number },
    lng: { type: Number },
    /** Optional km from SEAIT (overrides haversine when set) */
    distanceFromSEAIT: { type: Number },
    /** Optional walk time to SEAIT (minutes) */
    walkMins: { type: Number },
    /** Barangay / landmark label (e.g. Cebuano) */
    location: { type: String, trim: true },
    rating: { type: Number, min: 0, max: 5, default: 4 },
    panorama: { type: String, trim: true },
    reviews: [
      {
        text: { type: String, required: true, trim: true },
        sentiment: {
          joy: { type: Number, min: 0, max: 1, default: 0 },
          anger: { type: Number, min: 0, max: 1, default: 0 },
          satisfaction: { type: Number, min: 0, max: 1, default: 0 },
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    sentimentScore: { type: Number, min: 0, max: 1, default: 0.5 },
    listingStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    contactPhone: { type: String, trim: true },
    viewCount: { type: Number, default: 0, min: 0 },

    realEstateImages: [Object],

    // ✅ 360 VIRTUAL TOUR: Panorama path for 360° view
    panoramaPath: {
      type: String,
      default: "", // Empty string means no 360 image uploaded
    },

    propertyOwner: {
      type: mongoose.Types.ObjectId,
      ref: "OwnerUser",
      required: [true, "Please provide a property owner"],
    },
  },
  { timestamps: true }
);

RealEstateSchema.index({ lat: 1, lng: 1, sentimentScore: 1 });

export default mongoose.model("RealEstate", RealEstateSchema);
