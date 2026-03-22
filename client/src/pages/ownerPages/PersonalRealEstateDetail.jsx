import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getRealEstateDetail, clearAlert } from "../../features/realEstateOwner/realEstateOwnerSlice";
import { ImageCarousal, PageLoading, Footer } from "../../components";
import { Button } from "@mui/material";
import useToast from "../../hooks/useToast";
import { useOwnerBasePath } from "../../utils/ownerPaths";

function normalizeImages(images) {
  if (!images?.length) return [];
  return images
    .map((x) => (typeof x === "string" ? x : x?.url || x?.secure_url))
    .filter(Boolean);
}

export default function PersonalRealEstateDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const ownerBase = useOwnerBasePath();
  const { realEstate, isLoading, alertFlag, alertMsg, alertType } = useSelector(
    (s) => s.realEstateOwner
  );

  useToast({
    alertFlag,
    alertType,
    message: alertMsg,
    clearAlertAction: clearAlert,
  });

  useEffect(() => {
    dispatch(getRealEstateDetail({ slug }));
  }, [slug, dispatch]);

  if (isLoading || !realEstate) return <PageLoading />;

  const imgs = normalizeImages(realEstate.realEstateImages);
  const placeholder =
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 mt-8 mb-12">
        {imgs.length > 0 ? (
          <ImageCarousal imageSources={imgs} />
        ) : (
          <div className="rounded-lg overflow-hidden shadow h-72 md:h-96">
            <img src={placeholder} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3 justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{realEstate.title}</h1>
            <p className="text-slate-600 mt-2 whitespace-pre-wrap">{realEstate.description}</p>
            <p className="mt-4 font-semibold text-indigo-700">₱{realEstate.price?.toLocaleString?.()} / mo</p>
          </div>
          <Button
            component={Link}
            to={`${ownerBase}/real-estate/update/${slug}`}
            variant="contained"
            color="primary"
          >
            Edit listing
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
