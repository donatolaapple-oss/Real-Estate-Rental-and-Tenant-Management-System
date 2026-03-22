import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getRealEstateDetail,
  updateRealEstateDetail,
  clearAlert,
} from "../../features/realEstateOwner/realEstateOwnerSlice";
import { UpdatePropertyForm, PageLoading, Footer } from "../../components";
import useToast from "../../hooks/useToast";

export default function UpdateRealEstateDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { realEstate, isLoading, isProcessing, alertFlag, alertMsg, alertType } = useSelector(
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

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const form = document.getElementById("update-property-form");
      if (!form) return;
      const formData = new FormData(form);
      const formValues = Object.fromEntries(formData.entries());
      dispatch(updateRealEstateDetail({ slug, formValues }));
    },
    [dispatch, slug]
  );

  if (isLoading || !realEstate) return <PageLoading />;

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 mt-8 mb-12">
        <h2 className="text-xl font-bold mb-4">Update property</h2>
        <form id="update-property-form" onSubmit={handleSubmit}>
          <UpdatePropertyForm
            title={realEstate.title}
            description={realEstate.description}
            price={realEstate.price}
            category={realEstate.category}
            area={realEstate.area}
            floors={realEstate.floors}
            facing={realEstate.facing}
            address={realEstate.address}
            isProcessing={isProcessing}
          />
        </form>
      </main>
      <Footer />
    </>
  );
}
