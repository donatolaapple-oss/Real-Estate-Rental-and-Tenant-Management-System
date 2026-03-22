import RealEstate from "../models/RealEstate.js";
import { nanoid } from "nanoid";
import {
  NotFoundError,
  ForbiddenRequestError,
  BadRequestError,
} from "../request-errors/index.js";
import {
  cloudinaryMultipleUpload,
  cloudinaryDeleteImage,
} from "../utils/cloudinaryUpload.js";
import publicIdExtractor from "../utils/publicIdExtractor.js";

/**
 * @description Post Real Estate
 * @returns {object} realEstate
 */
const postRealEstate = async (req, res) => {
  const streetName = req.body.streetName;
  const city = req.body.city;
  const state = req.body.state;
  const country = req.body.country;

  req.body.address = { streetName, city, state, country };
  req.body.propertyOwner = req.user.userId;
  req.body.propertyId = nanoid(7);
  req.body.listingStatus = "pending";

  if (req.body.lat !== undefined && req.body.lat !== "") {
    const la = parseFloat(req.body.lat);
    if (!Number.isNaN(la)) req.body.lat = la;
    else delete req.body.lat;
  }
  if (req.body.lng !== undefined && req.body.lng !== "") {
    const ln = parseFloat(req.body.lng);
    if (!Number.isNaN(ln)) req.body.lng = ln;
    else delete req.body.lng;
  }

  const realEstate = await RealEstate.create(req.body);

  const realEstateImages = await cloudinaryMultipleUpload(req.files, "realEstateImages");
  realEstate.realEstateImages = realEstateImages;
  await realEstate.save();

  res.status(201).json({ realEstate });
};

/**
 * @description Get Owner's Real Estates
 * @returns {object} realEstate
 */
const getOwnerRealEstates = async (req, res) => {
  let realEstateResults = RealEstate.find({
    propertyOwner: req.user.userId,
  }).sort("-createdAt");

  const page = Number(req.query.page) || 1; //page number from query string
  const limit = 5; //limit of items per response
  const skip = (page - 1) * limit; //calculate the number of documents to skip

  realEstateResults = realEstateResults.skip(skip).limit(limit);
  const realEstates = await realEstateResults; //execute the query

  //get total documents in the RealEstate collection
  const totalRealEstates = await RealEstate.countDocuments({
    propertyOwner: req.user.userId,
  });

  //calculate total pages
  const numberOfPages = Math.ceil(totalRealEstates / limit);

  res.json({ realEstates, numberOfPages, totalRealEstates });
};

/**
 * @description Get single property
 * @returns {object} realEstate
 */
const getSingleProperty = async (req, res) => {
  const { slug } = req.params;
  const realEstate = await RealEstate.findOne({ slug });
  if (!realEstate) {
    throw new NotFoundError(`Property not found`);
  }
  res.json({ realEstate });
};

/**
 * @description Update Property Details
 * @returns {object} realEstate
 */
const updatePropertyDetails = async (req, res) => {
  const {
    price,
    streetName,
    city,
    state,
    country,
    description,
    area,
    floors,
    facing,
    category,
    lat,
    lng,
    location,
    panorama,
    panoramaPath,
    contactPhone,
    distanceFromSEAIT,
    walkMins,
  } = req.body;

  if (
    !price ||
    !streetName ||
    !city ||
    !state ||
    !country ||
    !description ||
    !area ||
    !floors ||
    !facing ||
    !category
  ) {
    throw new BadRequestError("All fields are required");
  }

  const { slug } = req.params;
  const realEstate = await RealEstate.findOne({ slug });

  if (!realEstate) {
    throw new NotFoundError(`Property not found`);
  }

  if (realEstate.propertyOwner.toString() !== req.user.userId) {
    throw new ForbiddenRequestError(
      "You are not authorized to update this property"
    );
  }

  const patch = {
    price,
    description,
    area,
    floors,
    facing,
    category,
    address: { streetName, city, state, country },
  };

  if (lat !== undefined && lat !== "") {
    const la = parseFloat(lat);
    if (!Number.isNaN(la)) patch.lat = la;
  }
  if (lng !== undefined && lng !== "") {
    const ln = parseFloat(lng);
    if (!Number.isNaN(ln)) patch.lng = ln;
  }
  if (location !== undefined) patch.location = location;
  if (panorama !== undefined) patch.panorama = panorama;
  if (panoramaPath !== undefined) patch.panoramaPath = panoramaPath;
  if (contactPhone !== undefined) patch.contactPhone = contactPhone;
  if (distanceFromSEAIT !== undefined && distanceFromSEAIT !== "") {
    const d = parseFloat(distanceFromSEAIT);
    if (!Number.isNaN(d)) patch.distanceFromSEAIT = d;
  }
  if (walkMins !== undefined && walkMins !== "") {
    const w = parseInt(walkMins, 10);
    if (!Number.isNaN(w)) patch.walkMins = w;
  }

  const updatedRealEstate = await RealEstate.findOneAndUpdate(
    { slug },
    patch,
    { new: true, runValidators: true }
  );

  res.json({ updatedRealEstate });
};

/**
 * @description Update Property Details
 * @returns message
 */
const deleteProperty = async (req, res) => {
  const { slug } = req.params;
  const realEstate = await RealEstate.findOne({ slug });

  if (!realEstate) {
    throw new NotFoundError(`Property not found`);
  }

  // check if user is authorized to delete property
  if (realEstate.propertyOwner.toString() !== req.user.userId) {
    throw new ForbiddenRequestError(
      "You are not authorized to delete this property"
    );
  }

  // check if property is okay to delete
  if (realEstate.status === false) {
    throw new BadRequestError(
      "Property cannot be deleted, it has active tenant"
    );
  }

  await RealEstate.findOneAndDelete({
    slug,
    propertyOwner: req.user.userId,
    status: true,
  });

  // delete property images from cloudinary
  const realEstateImageUrls = realEstate.realEstateImages;
  if (realEstateImageUrls && realEstateImageUrls.length > 0) {
    for (const imageUrl of realEstateImageUrls) {
      const publicId = publicIdExtractor(imageUrl);
      if (publicId) {
        await cloudinaryDeleteImage(publicId);
      }
    }
  }

  res.json({ success: true, message: "Property deleted successfully" });
};

export {
  postRealEstate,
  getOwnerRealEstates,
  getSingleProperty,
  updatePropertyDetails,
  deleteProperty,
};
