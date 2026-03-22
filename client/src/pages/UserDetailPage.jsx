import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getOwnerUserDetails,
  addOrRemoveContact,
} from "../features/tenantUser/tenantUserSlice";
import { getTenantUserDetails, addOrRemoveContact as ownerAddOrRemoveContact } from "../features/ownerUser/ownerUserSlice";
import { PageLoading, Footer } from "../components";
import { Button, Avatar } from "@mui/material";

export default function UserDetailPage({ userType }) {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const tenantState = useSelector((s) => s.tenantUser);
  const ownerState = useSelector((s) => s.ownerUser);
  const state = userType === "tenant" ? tenantState : ownerState;

  useEffect(() => {
    if (userType === "tenant") {
      dispatch(getOwnerUserDetails({ slug }));
    } else {
      dispatch(getTenantUserDetails({ slug }));
    }
  }, [dispatch, slug, userType]);

  const handleContact = () => {
    const id = state.user?._id;
    if (!id) return;
    if (userType === "tenant") {
      dispatch(addOrRemoveContact({ id }));
    } else {
      dispatch(ownerAddOrRemoveContact({ id }));
    }
  };

  if (state.isLoading) return <PageLoading />;

  const u = state.user;
  if (!u) {
    return (
      <main className="text-center mt-12">
        <p>User not found.</p>
      </main>
    );
  }

  return (
    <>
      <main className="max-w-xl mx-auto px-4 mt-10 mb-12">
        <div className="flex items-center gap-4 mb-6">
          <Avatar src={u.profileImage} alt="" sx={{ width: 72, height: 72 }} />
          <div>
            <h1 className="text-xl font-bold">
              {u.firstName} {u.lastName}
            </h1>
            <p className="text-slate-600 text-sm break-all">{u.email}</p>
          </div>
        </div>
        <Button variant="contained" onClick={handleContact} disabled={state.isProcessing}>
          {state.isContact ? "Remove from contacts" : "Add to contacts"}
        </Button>
      </main>
      <Footer />
    </>
  );
}
