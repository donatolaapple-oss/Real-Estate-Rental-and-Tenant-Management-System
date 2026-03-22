import RealEstate from "../models/RealEstate.js";
import { NotFoundError } from "../request-errors/index.js";
import TenantUser from "../models/TenantUser.js";

/**
 * @description Get all properties
 * @returns {object} realEstate array
 */
const getAllProperties = async (req, res) => {
  const { search, category, priceFilter } = req.query;

  const queryObject = {
    status: true,
    $or: [
      { listingStatus: "approved" },
      { listingStatus: { $exists: false } },
    ],
  };

  if (search) {
    queryObject.title = { $regex: search, $options: "i" };
  }

  if (category !== "all") {
    queryObject.category = category;
  }

  if (priceFilter) {
    const [minPrice, maxPrice] = priceFilter.split("-");
    queryObject.price = { $gte: minPrice, $lte: maxPrice };
  }

  let realEstateResult = RealEstate.find(queryObject)
    .populate({
      path: "propertyOwner",
      select: "-password -createdAt -updatedAt -__v -contacts",
    })
    .sort({ createdAt: -1 });

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  realEstateResult = realEstateResult.skip(skip).limit(limit);
  const allRealEstate = await realEstateResult;

  const totalRealEstates = await RealEstate.countDocuments(queryObject);
  const numberOfPages = Math.ceil(totalRealEstates / limit);

  res.json({ allRealEstate, numberOfPages, totalRealEstates });
};

// ✅ CHATBOT: Property search for intelligent recommendations
const chatbotPropertySearch = async (req, res) => {
  try {
    const { budget, bedrooms, location, category } = req.query;
    
    const queryObject = {
      status: true,
      $or: [
        { listingStatus: "approved" },
        { listingStatus: { $exists: false } },
      ],
    };
    
    // Budget filtering
    if (budget) {
      queryObject.price = { $lte: parseFloat(budget) };
    }
    
    // Bedroom filtering
    if (bedrooms) {
      queryObject.bedrooms = { $gte: parseInt(bedrooms) };
    }
    
    // Location filtering
    if (location) {
      queryObject["address.city"] = { $regex: location, $options: "i" };
    }
    
    // Category filtering
    if (category && category !== "all") {
      queryObject.category = category;
    }
    
    // Search for matching properties
    const properties = await RealEstate.find(queryObject)
      .populate({
        path: "propertyOwner",
        select: "firstName lastName email phoneNumber profileImage",
      })
      .sort({ price: 1 }) // Sort by price (cheapest first)
      .limit(5); // Limit to 5 results
    
    // If no exact matches, find closest alternatives
    if (properties.length === 0 && budget) {
      const closestProperties = await RealEstate.find({
        status: true,
        price: { $lte: parseFloat(budget) * 1.2 } // 20% above budget
      })
        .populate({
          path: "propertyOwner",
          select: "firstName lastName email phoneNumber profileImage",
        })
        .sort({ price: 1 })
        .limit(3);
      
      return res.json({
        properties: closestProperties,
        exactMatch: false,
        budget: parseFloat(budget),
        message: `I don't have anything for ₱${budget}, but here are the closest matches`
      });
    }
    
    res.json({
      properties,
      exactMatch: true,
      budget: budget ? parseFloat(budget) : null,
      message: `Found ${properties.length} properties matching your criteria`
    });
    
  } catch (error) {
    console.error('Chatbot property search error:', error);
    res.status(500).json({
      error: 'Failed to search properties',
      message: 'Please try again later'
    });
  }
};

/**
 * @description Get single property
 * @returns {object} realEstate
 */
const getSingleProperty = async (req, res) => {
  const { slug } = req.params;
  const { userId } = req.user;

  const realEstate = await RealEstate.findOne({ slug }).populate({
    path: "propertyOwner",
    select: "-password -createdAt -updatedAt -__v -contacts",
  });

  if (!realEstate) {
    throw new NotFoundError(`Property was not found`);
  }

  const { _id: id } = realEstate;

  //check if property is saved by user
  const currentTenantUser = await TenantUser.findById(userId);
  const isSaved = currentTenantUser.savedProperties.includes(id.toString());

  res.json({ realEstate, isSaved });
};

/**
 * @description Save property if not saved otherwise remove from saved list
 * @returns {object} TenantUser
 */
const savePropertyToggle = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const toSaveProperty = await RealEstate.findById(id);

  if (!toSaveProperty) {
    throw new NotFoundError(`Property with id: ${id} not found`);
  }
  const currentTenantUser = await TenantUser.findById(userId);

  //check if property is already saved by user and remove it from saved properties
  if (currentTenantUser.savedProperties.includes(id)) {
    currentTenantUser.savedProperties =
      currentTenantUser.savedProperties.filter(
        (propertyId) => propertyId.toString() !== id
      );
    const updatedUser = await TenantUser.findOneAndUpdate(
      { _id: userId },
      {
        savedProperties: currentTenantUser.savedProperties,
      },
      { new: true, runValidators: true }
    );

    res.json({
      updatedUser,
      message: "Property removed from saved properties",
      isSaved: false,
    });
  } else {
    //add property to saved properties
    const updatedUser = await TenantUser.findOneAndUpdate(
      { _id: userId },
      {
        $push: { savedProperties: id },
      },
      { new: true, runValidators: true }
    );

    res.json({
      updatedUser,
      message: "Property saved successfully",
      isSaved: true,
    });
  }
};

/**
 * @description Get all properties
 * @returns {object} realEstate array
 */
const getAllSavedProperties = async (req, res) => {
  const { userId } = req.user;

  const currentTenantUser = await TenantUser.findById(userId).populate({
    path: "savedProperties",
    select: "-createdAt -updatedAt -__v",

    populate: {
      path: "propertyOwner",
      model: "OwnerUser",
      select: "-createdAt -updatedAt -__v -contacts",
    },
  });

  if (!currentTenantUser) {
    throw new NotFoundError(`User with id: ${userId} not found`);
  }

  // reverse the saved properties array to show the latest saved property first
  currentTenantUser.savedProperties.reverse();

  res.json({ savedProperties: currentTenantUser.savedProperties });
};

export {
  getAllProperties,
  getSingleProperty,
  savePropertyToggle,
  getAllSavedProperties,
  chatbotPropertySearch,
};
