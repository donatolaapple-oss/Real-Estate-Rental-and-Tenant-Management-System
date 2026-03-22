import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { getSingleRealEstate } from "../../features/realEstateTenant/realEstateTenantSlice";
import { PageLoading, Footer, ImageCarousal } from "../../components";
import { format, dateFormatter, createNumberFormatter } from "../../utils/valueFormatter";
import { CardActionArea, Avatar, Button } from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import ContactsRoundedIcon from "@mui/icons-material/ContactsRounded";
import SquareFootRoundedIcon from "@mui/icons-material/SquareFootRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import HorizontalSplitRoundedIcon from "@mui/icons-material/HorizontalSplitRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ArticleIcon from "@mui/icons-material/Article";
import MapsHomeWorkIcon from "@mui/icons-material/MapsHomeWork";
import MailIcon from "@mui/icons-material/Mail";
import { countries } from "../../utils/countryList";
import countryToCurrency from "country-to-currency";

// ✅ 360 VIEWER: Offline 360 photo viewer with Pannellum-like functionality
const Viewer360 = {
  isInitialized: false,
  currentImageIndex: 0,
  images: [],
  isDragging: false,
  startX: 0,
  currentRotation: 0,
  
  init: (images, containerId) => {
    Viewer360.images = images || [];
    Viewer360.currentImageIndex = 0;
    Viewer360.currentRotation = 0;
    Viewer360.isInitialized = true;
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create 360 viewer container
    const viewerContent = document.createElement('div');
    viewerContent.id = 'viewer-360-content';
    viewerContent.style.cssText = `
      width: 100%;
      height: 400px;
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      background: #000;
      cursor: grab;
    `;
    
    // Create image display
    const imageDisplay = document.createElement('img');
    imageDisplay.id = 'viewer-360-image';
    imageDisplay.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.1s ease-out;
      user-select: none;
      -webkit-user-drag: none;
      -khtml-user-drag: none;
      -moz-user-drag: none;
      -o-user-drag: none;
    `;
    
    // Add controls
    const controls = document.createElement('div');
    controls.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 10;
    `;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '←';
    prevBtn.style.cssText = `
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    `;
    prevBtn.onclick = () => Viewer360.previousImage();
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '→';
    nextBtn.style.cssText = `
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    `;
    nextBtn.onclick = () => Viewer360.nextImage();
    
    // Image counter
    const counter = document.createElement('span');
    counter.id = 'viewer-360-counter';
    counter.style.cssText = `
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    `;
    counter.textContent = '1 / ' + Viewer360.images.length;
    
    controls.appendChild(prevBtn);
    controls.appendChild(counter);
    controls.appendChild(nextBtn);
    
    viewerContent.appendChild(imageDisplay);
    viewerContent.appendChild(controls);
    container.appendChild(viewerContent);
    
    // Load first image
    if (Viewer360.images.length > 0) {
      imageDisplay.src = Viewer360.images[0];
    }
    
    // Add drag functionality for 360 rotation
    Viewer360.addDragFunctionality(imageDisplay);
  },
  
  addDragFunctionality: (element) => {
    element.addEventListener('mousedown', (e) => {
      Viewer360.isDragging = true;
      Viewer360.startX = e.clientX;
      element.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!Viewer360.isDragging) return;
      
      const deltaX = e.clientX - Viewer360.startX;
      Viewer360.currentRotation += deltaX * 0.5;
      element.style.transform = `rotateY(${Viewer360.currentRotation}deg)`;
      Viewer360.startX = e.clientX;
    });
    
    document.addEventListener('mouseup', () => {
      Viewer360.isDragging = false;
      element.style.cursor = 'grab';
    });
  },
  
  previousImage: () => {
    if (Viewer360.images.length === 0) return;
    Viewer360.currentImageIndex = (Viewer360.currentImageIndex - 1 + Viewer360.images.length) % Viewer360.images.length;
    Viewer360.updateImage();
  },
  
  nextImage: () => {
    if (Viewer360.images.length === 0) return;
    Viewer360.currentImageIndex = (Viewer360.currentImageIndex + 1) % Viewer360.images.length;
    Viewer360.updateImage();
  },
  
  updateImage: () => {
    const imageDisplay = document.getElementById('viewer-360-image');
    const counter = document.getElementById('viewer-360-counter');
    
    if (imageDisplay && Viewer360.images[Viewer360.currentImageIndex]) {
      imageDisplay.src = Viewer360.images[Viewer360.currentImageIndex];
      Viewer360.currentRotation = 0;
      imageDisplay.style.transform = 'rotateY(0deg)';
    }
    
    if (counter) {
      counter.textContent = `${Viewer360.currentImageIndex + 1} / ${Viewer360.images.length}`;
    }
  },
  
  destroy: () => {
    const container = document.getElementById('viewer-360-container');
    if (container) {
      container.innerHTML = '';
    }
    Viewer360.isInitialized = false;
  }
};

const RentalPropertyDetail = () => {
  const { realEstate, isLoading } = useSelector(
    (state) => state.realEstateTenant
  );

  const dispatch = useDispatch();
  const { slug } = useParams();
  const [show360Viewer, setShow360Viewer] = useState(false); // 360 viewer state
  const viewer360Ref = useRef(null); // Reference for 360 viewer container

  const currentCountry = countries.find(
    (country) => country.label === realEstate?.address?.country
  );
  const format = createNumberFormatter(currentCountry?.code);

  useEffect(() => {
    dispatch(getSingleRealEstate({ slug }));
  }, [slug, dispatch]);
  
  // ✅ 360 VIEWER: Initialize when shown
  useEffect(() => {
    if (show360Viewer && realEstate && viewer360Ref.current) {
      // ✅ PANORAMA PATH: Use 360 image from database or fallback
      const panoramaImages = [];
      
      if (realEstate.panoramaPath && realEstate.panoramaPath !== "") {
        // Use panorama from database
        panoramaImages.push(realEstate.panoramaPath);
      } else if (realEstate.realEstateImages && realEstate.realEstateImages.length > 0) {
        // Use regular property images as fallback
        panoramaImages.push(...realEstate.realEstateImages);
      } else {
        // Use local fallback image
        panoramaImages.push('/assets/default-360.jpg');
      }
      
      Viewer360.init(panoramaImages, 'viewer-360-container');
    } else if (!show360Viewer) {
      Viewer360.destroy();
    }
    
    return () => {
      Viewer360.destroy();
    };
  }, [show360Viewer, realEstate?.panoramaPath, realEstate?.realEstateImages]);

  if (isLoading) return <PageLoading />;

  if (!realEstate)
    return <h1 className="mt-6 text-center">No real estate found</h1>;

  return (
    <>
      <main className="mb-12 mt-10 mx-4 md:mx-12">
        <div className="flex flex-col gap-4 mx-auto">
          <h3 className="font-heading font-bold">Rental Property Detail</h3>
          <section className="flex flex-col gap-12 rounded-md md:flex-row">
            <div className="w-full md:w-2/3">
              {/* ✅ EXPANDABLE 360 VIEWER: Conditional rendering */}
              {show360Viewer ? (
                <div className="w-full">
                  <div 
                    ref={viewer360Ref}
                    id="viewer-360-container"
                    style={{
                      width: '100%',
                      height: '400px',
                      borderRadius: '8px',
                      border: '2px solid #1976d2',
                      backgroundColor: '#f5f5f5'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      <span>🌐 Loading 360° Virtual Tour...</span>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-600">
                      <strong>Instructions:</strong> Drag to rotate • Use arrows to navigate • Click and drag for 360° view
                    </p>
                  </div>
                </div>
              ) : (
                <ImageCarousal imageSources={realEstate?.realEstateImages} />
              )}
              
              {/* ✅ 360 VIRTUAL TOUR BUTTON */}
              <div className="mt-4">
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => setShow360Viewer(!show360Viewer)}
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                    marginBottom: 2,
                    width: "100%",
                  }}
                  startIcon={<span>🌐</span>}
                >
                  {show360Viewer ? 'Back to Photos' : '360° Virtual Tour'}
                </Button>
              </div>
            </div>
            <div className="flex flex-col rounded-md gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold">{realEstate?.title}</h3>
                <div>
                  <p className="font-roboto text-gray-500">
                    {realEstate?.category}
                  </p>
                </div>
                <p className="-ml-1 text-base tracking-tight">
                  <LocationOnOutlinedIcon sx={{ color: "#019149" }} />
                  {realEstate?.address?.streetName}, {" "}
                  {realEstate?.address?.city},{" "}
                  {realEstate?.address?.state}, {" "}
                  {realEstate?.address?.country}
                </p>
                <div className="">
                  <p className="font-robotoNormal text-xs font-semibold tracking-tight">
                    Posted on: {dateFormatter(realEstate?.createdAt)}
                  </p>
                  <p className="font-robotoNormal text-xs tracking-tight">
                    Id: {realEstate?.propertyId}
                  </p>
                </div>
              </div>
              <div className="">
                <div className="rounded-md">
                  <p className="font-roboto text-primaryDark leading-4 ">
                    RENT per month
                  </p>
                  <span className="font-semibold text-lg text-primaryDark">
                    {countryToCurrency[currentCountry.code]} {format(realEstate?.price)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <Link to={`/tenant/lease/${realEstate?._id}/${slug}`}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    sx={{ color: "#fff" }}
                    startIcon={<ArticleIcon />}
                  >
                    View Lease
                  </Button>
                </Link>
                <Link
                  to={`/tenant/rentDetail/${realEstate?._id + "/" + slug}`}
                  state={{ realEstateId: realEstate?._id }}
                >
                  <Button
                    variant="contained"
                    color="tertiary"
                    size="small"
                    sx={{ color: "#fff" }}
                    startIcon={<MapsHomeWorkIcon />}
                  >
                    Rent Detail
                  </Button>
                </Link>
                <Link to={`/tenant/send-complaint/${slug}`}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ color: "#fff" }}
                    startIcon={<MailIcon />}
                  >
                    Send Complaint
                  </Button>
                </Link>
              </div>
            </div>
          </section>
          <article className="mt-2">
            <Link to={`/tenant/owner-user/${realEstate?.propertyOwner?.slug}`}>
              <CardActionArea sx={{ borderRadius: "6px" }}>
                <div className="shadow-lg rounded-md p-4">
                  <div className="flex gap-2 items-center">
                    <h4 className="font-medium">Contact Info</h4>
                    <ContactsRoundedIcon color="secondary" />
                  </div>
                  <div className="flex mt-4 gap-2 items-center">
                    <Avatar
                      src={realEstate?.propertyOwner?.profileImage}
                      alt={(realEstate?.propertyOwner?.firstName).toUpperCase()}
                    />
                    <p className="leading-4">
                      {realEstate?.propertyOwner?.firstName}{" "}
                      {realEstate?.propertyOwner?.lastName}
                    </p>
                  </div>
                  <div className="flex mt-2 ml-1 gap-2 items-center">
                    <LocalPhoneRoundedIcon sx={{ color: "#6D9886" }} />
                    <p className="ml-3">
                      {realEstate?.propertyOwner?.phoneNumber}
                    </p>
                  </div>
                  <div className="flex mt-2 ml-1 gap-2 items-center">
                    <EmailRoundedIcon sx={{ color: "#E7AB79" }} />
                    <p className="overflow-auto">
                      {realEstate?.propertyOwner?.email}
                    </p>
                  </div>
                </div>
              </CardActionArea>
            </Link>
          </article>
          <div className="">
            <h3 className="font-semibold p-3">Description</h3>
            <hr className="w-3/4 ml-3 border-t-2 rounded-md" />
            <p className="text-lg p-3 tracking-normal">
              {realEstate?.description}
            </p>
          </div>
          <div className="">
            <h3 className="font-semibold p-3">Overview</h3>
            <hr className="w-3/4 ml-3 border-t-2 rounded-md" />
            <div className="flex flex-wrap">
              <div className="flex p-3 mt-2 gap-2 items-center">
                <span>
                  <SquareFootRoundedIcon sx={{ color: "#738FA7" }} />
                </span>
                <span className="font-semibold"> Area of Property </span>
                <p className="">{format(realEstate?.area)} sq. feet</p>
              </div>
              <div className="flex p-3 mt-2 gap-2 items-center">
                <span>
                  <HorizontalSplitRoundedIcon />
                </span>
                <span className="font-semibold">
                  Number of {realEstate?.floors > 1 ? "floors" : "floor"}
                </span>
                <p className="">{format(realEstate?.floors)} </p>
              </div>
              <div className="flex p-3 mt-2 gap-2 items-center">
                <span>
                  <ExploreRoundedIcon sx={{ color: "#29b46e" }} />
                </span>
                <span className="font-semibold"> Property Facing </span>
                <p className="">{realEstate?.facing}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RentalPropertyDetail;
