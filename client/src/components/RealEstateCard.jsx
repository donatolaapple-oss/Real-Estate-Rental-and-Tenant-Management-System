import {
  Button,
  CardActionArea,
  Avatar,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { createNumberFormatter } from "../utils/valueFormatter";
import { Link, useLocation } from "react-router-dom";
import countryToCurrency from "country-to-currency";
import { countries } from "../utils/countryList";

// ✅ 360 VIEWER: Offline 360 photo viewer
const Viewer360 = {
  createViewer: (images, propertyId) => {
    const viewerContainer = document.createElement('div');
    viewerContainer.id = `viewer-360-${propertyId}`;
    viewerContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: move;
    `;
    
    const viewerContent = document.createElement('div');
    viewerContent.style.cssText = `
      width: 90%;
      height: 80%;
      max-width: 800px;
      max-height: 600px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      padding: 20px;
      position: relative;
    `;
    
    // Create 360 image gallery
    const imageGallery = document.createElement('div');
    imageGallery.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 20px;
      max-height: 400px;
      overflow-y: auto;
    `;
    
    images.forEach((image, index) => {
      const img = document.createElement('img');
      img.src = image;
      img.style.cssText = `
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 4px;
        cursor: pointer;
        transition: transform 0.3s ease;
      `;
      img.onclick = () => Viewer360.showImage(image, index);
      imageGallery.appendChild(img);
    });
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close 360° View';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #ff4757;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      z-index: 10000;
    `;
    closeBtn.onclick = () => document.body.removeChild(viewerContainer);
    
    viewerContent.appendChild(imageGallery);
    viewerContent.appendChild(closeBtn);
    viewerContainer.appendChild(viewerContent);
    
    // Add to page
    document.body.appendChild(viewerContainer);
  },
  
  showImage: (image, index) => {
    const mainImage = viewerContainer.querySelector('.viewer-360-main-image');
    if (mainImage) {
      mainImage.src = image;
    } else {
      const newMainImage = document.createElement('img');
      newMainImage.src = image;
      newMainImage.style.cssText = `
        width: 100%;
        height: 300px;
        object-fit: contain;
        border-radius: 8px;
        margin-bottom: 10px;
      `;
      newMainImage.className = 'viewer-360-main-image';
      viewerContent.insertBefore(newMainImage, viewerContent.firstChild);
    }
  }
};

const RealEstateCard = ({
  title,
  slug,
  price,
  category,
  address,
  realEstateImages,
  propertyOwner,
  fromOwnerUser,
  fromUserProfile,
}) => {
  const { pathname } = useLocation();
  const ownerBase = pathname.startsWith("/landlord") ? "/landlord" : "/owner";
  const currentCountry = countries.find(
    (country) => country.label === address?.country
  );
  const format = createNumberFormatter(currentCountry?.code || "PH");
  
  // 360 VIEWER: Check if property has 360 images
  const imageSrc =
    Array.isArray(realEstateImages) && realEstateImages.length > 0
      ? typeof realEstateImages[0] === "string"
        ? realEstateImages[0]
        : realEstateImages[0]?.url || realEstateImages[0]?.secure_url
      : null;
  const has360Images = Array.isArray(realEstateImages) && realEstateImages.length > 0;
  
  return (
    <Link
      to={
        fromOwnerUser
          ? `${ownerBase}/real-estate/${slug}`
          : `/tenant/real-estate/${slug}`
      }
    >
      <Card
        sx={{
          width: 345,
          bgcolor: "transparent",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 5px 0 rgba(0,0,0,0.2)",
          },
          color: "#102a43",
        }}
      >
          <CardActionArea>
            <CardMedia
              component="img"
              sx={{ maxHeight: 150, objectFit: "cover", bgcolor: "#e2e8f0" }}
              image={
                imageSrc ||
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
              }
              alt={title}
            />
            <CardContent>
              <h4
                className="mb-1 overflow-hidden overflow-ellipsis whitespace-nowrap hover:text-primaryDark transition-all duration-300 ease-in-out"
                style={{ maxWidth: "31ch" }}
              >
                {title}
              </h4>
              <p className="text-sm text-gray-400">{category}</p>
              <p className="font-semibold">
              {countryToCurrency[currentCountry?.code || "PH"]}{" "}
              <span className="">{format(price)}</span> / month
              </p>
              <p className="text-base">
              <LocationOnOutlinedIcon color="secondary" />{address?.streetName}, {address?.city}
              </p>
              
              {/* 360 VIEWER BUTTON */}
              {has360Images && (
                <div className="mt-2">
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      Viewer360.createViewer(
                        (realEstateImages || []).map((x) =>
                          typeof x === "string" ? x : x?.url || x?.secure_url
                        ),
                        slug
                      );
                    }}
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#1565c0",
                      },
                    }}
                  >
                    360° Virtual Tour
                  </Button>
                </div>
              )}
            </CardContent>
        </CardActionArea>
        {/*  render the contact bar only if the user is not the owner of the property */}
        {!fromOwnerUser && !fromUserProfile && (
          <div className="flex p-2">
            <div className="flex items-center gap-1">
              <Avatar
                src={propertyOwner?.profileImage}
                alt={propertyOwner?.firstName}
                sx={{ width: 36, height: 36 }}
              />
              <span className="font-semibold text-xs text-gray-600">
                {propertyOwner?.firstName} {propertyOwner?.lastName}
              </span>
            </div>
            <Link
              className="ml-auto"
              to={`/tenant/owner-user/${propertyOwner?.slug}`}
            >
              <Button
                size="small"
                color="tertiary"
                variant="outlined"
                sx={{
                  color: "#0496b4",
                }}
              >
                Owner Details
              </Button>
            </Link>
          </div>
        )}
    </Card>
    </Link>
  );
};

export default RealEstateCard;
