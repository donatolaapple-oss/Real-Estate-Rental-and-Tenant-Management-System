import { useEffect, useState, useCallback } from "react";
import {
  Logo,
  FormPasswordField,
  FormTextField,
} from "../components";
import { useDispatch, useSelector } from "react-redux";
import {
  clearAlert,
  loginLandlord,
  loginTenant,
  loginAdmin,
  stateClear,
  createAlert,
} from "../features/auth/authSlice";
import { useNavigate, useParams, Link } from "react-router-dom";
import loginImg from "../assets/images/loginImg.svg";
import { Button } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import useToast from "../hooks/useToast";

const Login = () => {
  const {
    user,
    accountStatus,
    success,
    userType,
    errorMsg,
    errorFlag,
    alertType,
    isLoading,
  } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const param = useParams();
  const dispatch = useDispatch();

  const [values, setFormValues] = useState({ email: "", password: "" });

  useToast({
    alertFlag: errorFlag,
    alertType,
    message: errorMsg,
    clearAlertAction: clearAlert,
  });

  const dashboardFor = (type) => {
    if (type === "admin") return "/admin/dashboard";
    if (type === "tenant") return "/tenant/dashboard";
    if (type === "landlord") return "/landlord/dashboard";
    return "/";
  };

  useEffect(() => {
    if (user && userType) {
      navigate(dashboardFor(userType));
    }
  }, [user, navigate, userType]);

  useEffect(() => {
    if (success && accountStatus) {
      navigate(dashboardFor(userType));
    } else if (success && !accountStatus) {
      navigate(`/account-created/${userType}`);
      dispatch(stateClear());
    }
  }, [accountStatus, success, navigate, userType, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = values;
    const role = param.role;
    if (!role || !["landlord", "owner", "tenant", "admin"].includes(role)) {
      dispatch(
        createAlert(
          "Use a role-specific link: #/login/tenant, #/login/landlord, or #/login/admin"
        )
      );
      return;
    }
    const userInfo = {
      email,
      password,
      role,
    };
    if (role === "landlord" || role === "owner") {
      dispatch(loginLandlord({ userInfo }));
    } else if (role === "tenant") {
      dispatch(loginTenant({ userInfo }));
    } else if (role === "admin") {
      dispatch(loginAdmin({ userInfo }));
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFillCredentials = useCallback(
    (e) => {
      e?.preventDefault?.();
      // Vite exposes env via import.meta.env; `process` is undefined in the browser.
      const adminEmail =
        import.meta.env.VITE_ADMIN_DEMO_EMAIL || "admin@stayscout.com";
      const emails = {
        landlord: "landlord@stayscout.com",
        owner: "landlord@stayscout.com",
        tenant: "tenant@stayscout.com",
        admin: adminEmail,
      };
      const role = param.role;
      const password =
        role === "admin" ? "admin123" : role === "landlord" || role === "owner" ? "landlord123" : "tenant123";
      setFormValues({
        email: emails[role] ?? emails.tenant,
        password,
      });
    },
    [param.role]
  );

  return (
    <div>
      <header className="flex m-1 shadow-sm">
        <Logo />
        <div className="flex flex-col justify-center ml-2">
          <h5 className="font-display">StayScout</h5>
          <p className="hidden text-xs md:block md:text-sm">
            AI boarding house finder
          </p>
        </div>
      </header>

      <main className="px-6 h-full mt-12">
        <div className="flex lg:justify-between justify-center items-center flex-wrap h-full g-6">
          <div className="grow-0 shrink-1 md:shrink-0 basis-auto lg:w-6/12 md:w-9/12 mb-12 md:mb-0">
            <img src={loginImg} className="w-full" alt="login banner" />
          </div>
          <div className="lg:w-5/12 md:w-8/12 mb-12 md:mb-0">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-center mb-6">
                <h3 className="text-center">Login to your account</h3>
              </div>

              <div className="flex flex-col gap-6 mb-2">
                <FormTextField
                  value={values.email}
                  name={"email"}
                  type={"email"}
                  label={"Email"}
                  handleChange={handleChange}
                  autoFocus={true}
                />
                <FormPasswordField
                  value={values.password}
                  handleChange={handleChange}
                />
                <div>
                  <Button
                    type="button"
                    variant="contained"
                    size="medium"
                    color="tertiary"
                    disabled={isLoading}
                    sx={{
                      color: "white",
                    }}
                    onClick={handleFillCredentials}
                  >
                    Fill with demo credentials
                  </Button>
                </div>
                <div className="self-end">
                  <Link
                    to={`/forgot-password/${param.role}`}
                    className="text-sm text-tertiary font-robotoNormal hover:text-tertiaryDark transition duration-200 ease-in-out"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <div className="text-center">
                <div className="mx-auto w-3/4 md:w-1/3">
                  <Button
                    variant="contained"
                    type="submit"
                    size="medium"
                    color="primary"
                    disabled={isLoading}
                    sx={{
                      color: "white",
                      width: "100%",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                        opacity: [0.9, 0.8, 0.7],
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress
                        size={26}
                        sx={{
                          color: "#fff",
                        }}
                      />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
                {param.role !== "admin" && (
                  <p className="text-sm font-medium mt-4 pt-1 mb-0 md:text-base">
                    Don&apos;t have an account?{" "}
                    <Link
                      to={`/register/${param.role}`}
                      className="text-secondary hover:text-secondaryDark transition duration-200 ease-in-out"
                    >
                      Register
                    </Link>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
