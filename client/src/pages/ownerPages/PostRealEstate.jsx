import { useState, useCallback, useEffect } from "react";
import {
  FormTextField,
  FormSelectField,
  CountrySelectField,
  ImageDropZone,
} from "../../components";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  postRealEstate,
  getRealEstateDetail,
  updateRealEstateDetail,
  clearAlert,
  createAlert,
} from "../../features/realEstateOwner/realEstateOwnerSlice";

import postRealEstateImg from "../../assets/images/postRealEstateImg.svg";
import postRealEstateImg2 from "../../assets/images/postRealEstateImg2.svg";
import postRealEstateImg3 from "../../assets/images/postRealEstateImg3.svg";

import {
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import BungalowIcon from "@mui/icons-material/Bungalow";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import countryToCurrency from "country-to-currency";
import useToast from "../../hooks/useToast";
import PropertyLocationPicker from "../../components/PropertyLocationPicker";

const PostRealEstate = () => {
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get("slug");
  const {
    alertFlag,
    alertMsg,
    alertType,
    isLoading,
    postSuccess,
    realEstate,
    isProcessing,
  } = useSelector((store) => store.realEstateOwner);

  const initialFormValues = {
    title: "",
    price: "",
    description: "",
    streetName: "",
    city: "",
    state: "",
    country: "",
    countryCode: "",
    category: "",
    area: "",
    floors: "",
    facing: "",
    lat: "",
    lng: "",
    location: "",
    panorama: "",
  };

  const [values, setFormValues] = useState(initialFormValues);

  const [images, setImages] = useState([]);

  useToast({
    alertFlag,
    alertType,
    message: alertMsg,
    clearAlertAction: clearAlert,
  });

  const handleChange = useCallback(
    (e) => {
      setFormValues({ ...values, [e.target.name]: e.target.value });
    },
    [values]
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (editSlug) {
      dispatch(getRealEstateDetail({ slug: editSlug }));
    }
  }, [editSlug, dispatch]);

  useEffect(() => {
    if (!editSlug || !realEstate) return;
    const p = realEstate;
    setFormValues({
      title: p.title || "",
      price: String(p.price ?? ""),
      description: p.description || "",
      streetName: p.address?.streetName || "",
      city: p.address?.city || "",
      state: p.address?.state || "",
      country: p.address?.country || "",
      countryCode: p.countryCode || "",
      category: p.category || "",
      area: String(p.area ?? ""),
      floors: String(p.floors ?? ""),
      facing: p.facing || "",
      lat: p.lat != null ? String(p.lat) : "",
      lng: p.lng != null ? String(p.lng) : "",
      location: p.location || "",
      panorama: p.panorama || p.panoramaPath || "",
    });
  }, [editSlug, realEstate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editSlug) {
      const formValues = {
        price: Number(values.price),
        streetName: values.streetName,
        city: values.city,
        state: values.state,
        country: values.country,
        description: values.description,
        area: Number(values.area),
        floors: Number(values.floors),
        facing: values.facing,
        category: values.category,
        lat: values.lat,
        lng: values.lng,
        location: values.location,
        panorama: values.panorama,
        panoramaPath: values.panorama,
      };
      dispatch(updateRealEstateDetail({ slug: editSlug, formValues }));
      return;
    }

    const form = document.getElementById("form");
    const formData = new FormData(form);

    if (images.length < 1) {
      dispatch(createAlert("Please upload at least one image"));
      return;
    }

    images.forEach((image) => {
      formData.append("realEstateImages", image);
    });

    dispatch(postRealEstate({ formData }));
  };

  const navigate = useNavigate();

  // Redirect to detail page of the property after successful posting
  useEffect(() => {
    if (postSuccess) {
      const timer = setTimeout(() => {
        navigate("/landlord/dashboard");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [postSuccess, navigate, realEstate]);

  return (
    <div>
      <main className="px-6 h-full mt-10">
        <div className="flex lg:justify-between justify-center flex-wrap h-full g-6">
          <div className="lg:w-5/12 md:w-8/12 mb-12">
            <form onSubmit={handleSubmit} id="form">
              <div className="flex flex-col justify-center items-center mt-3 mb-4">
                <h3 className="font-heading font-bold">
                  {editSlug ? "Edit your property" : "Post your property"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {editSlug
                    ? "Update details (title is fixed; images managed separately)"
                    : "Enter the details of your property"}
                </p>
              </div>
              <div className="flex flex-wrap flex-col gap-2 ml-5">
                <div className="flex flex-col gap-4 my-2">
                  <h5 className="mb-1">
                    <InfoIcon /> Initial Details
                  </h5>
                  <FormTextField
                    label="Title"
                    name="title"
                    type={"text"}
                    value={values.title}
                    handleChange={handleChange}
                    autoFocus={true}
                  />
                  <TextField
                    label="Description"
                    required
                    multiline
                    rows={4}
                    color="tertiary"
                    placeholder="Description of your property"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-4 my-2">
                  <h5 className="mb-1">
                    <LocationOnIcon /> Address
                  </h5>
                  <FormTextField
                    label="Street Name / Landmark"
                    name="streetName"
                    type={"text"}
                    value={values.streetName}
                    handleChange={handleChange}
                  />
                  <FormTextField
                    label="City"
                    name="city"
                    type={"text"}
                    value={values.city}
                    handleChange={handleChange}
                  />
                  <FormTextField
                    label="State"
                    name="state"
                    type={"text"}
                    value={values.state}
                    handleChange={handleChange}
                  />

                  <CountrySelectField
                    value={values.country}
                    setFormValues={setFormValues}
                    handleChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-2">StayScout map (Tupi area)</p>
                  <FormTextField
                    label="Barangay / area label (e.g. Cebuano)"
                    name="location"
                    type="text"
                    value={values.location}
                    handleChange={handleChange}
                  />
                  <FormTextField
                    label="Latitude"
                    name="lat"
                    type="text"
                    value={values.lat}
                    handleChange={handleChange}
                  />
                  <FormTextField
                    label="Longitude"
                    name="lng"
                    type="text"
                    value={values.lng}
                    handleChange={handleChange}
                  />
                  <PropertyLocationPicker
                    lat={values.lat}
                    lng={values.lng}
                    onChange={(coords) =>
                      setFormValues((prev) => ({
                        ...prev,
                        lat: coords.lat,
                        lng: coords.lng,
                      }))
                    }
                  />
                  <FormTextField
                    label="360° panorama image URL (optional)"
                    name="panorama"
                    type="text"
                    value={values.panorama}
                    handleChange={handleChange}
                  />
                </div>
                <div className="flex flex-col gap-4 my-2">
                  <h5 className="mb-1">
                    <BungalowIcon /> Property Info
                  </h5>
                  <TextField
                    label="Price"
                    name="price"
                    type="number"
                    placeholder="Rent per month"
                    required
                    value={values.price}
                    color="tertiary"
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {countryToCurrency[values.countryCode]}
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormSelectField
                    label="Category"
                    name="category"
                    options={[
                      "House",
                      "Apartment",
                      "Room",
                      "Shop Space",
                      "Office Space",
                    ]}
                    value={values.category}
                    handleChange={handleChange}
                  />

                  <TextField
                    label="Area"
                    name="area"
                    type="number"
                    placeholder="Area of the property"
                    required
                    value={values.area}
                    color="tertiary"
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">sq. feet</InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Floors"
                    name="floors"
                    type="number"
                    placeholder="Number of floors"
                    required
                    value={values.floors}
                    color="tertiary"
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">floors</InputAdornment>
                      ),
                    }}
                  />
                  <FormSelectField
                    label="Property Facing"
                    name="facing"
                    options={[
                      "North",
                      "South",
                      "East",
                      "West",
                      "North-East",
                      "North-West",
                      "South-East",
                      "South-West",
                    ]}
                    value={values.facing}
                    handleChange={handleChange}
                  />
                </div>

                <div className="flex flex-col my-2">
                  <ImageDropZone
                    fileState={images}
                    setFileState={setImages}
                    label={"Upload Images of your Property"}
                    maxFiles={10}
                  />
                </div>
              </div>

              <div className="text-center mt-2">
                <Button
                  disabled={
                    isLoading ||
                    isProcessing ||
                    (alertFlag && alertType === "success")
                  }
                  type="submit"
                  variant="contained"
                  size="large"
                  color="primary"
                  sx={{
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                      opacity: [0.9, 0.8, 0.7],
                    },
                    width: "25%",
                  }}
                >
                  {isLoading ? (
                    <CircularProgress
                      size={26}
                      sx={{
                        color: "#fff",
                      }}
                    />
                  ) : editSlug ? (
                    "Update"
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            </form>
          </div>
          <div className="hidden grow-0 shrink-1 md:shrink-0 basis-auto w-5/12 mb-12 lg:block">
            <img
              src={postRealEstateImg}
              className="w-full"
              alt="Cartoon of a person holding a card"
            />
            <img
              src={postRealEstateImg2}
              className="w-full"
              alt="Cartoon of a person holding a card"
            />
            <img
              src={postRealEstateImg3}
              className="w-full"
              alt="Cartoon of a person holding a card"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostRealEstate;
