import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { logOut } from "../features/auth/authSlice";


const ProtectedRoutes = ({ children, source }) => {
  const { user, userType } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const match =
    user &&
    (userType === source ||
      (source === "landlord" && userType === "owner"));
  if (!match) {
    dispatch(logOut());
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoutes;
