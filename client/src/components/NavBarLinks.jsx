import { useContext } from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { SocketContext } from "../utils/SocketContext";

const NavBarLinksOwner = ({ toggleMenu }) => {
  const { unreadMessageCount } = useContext(SocketContext);
  return (
    <>
      <Link to="/landlord/dashboard" onClick={toggleMenu} className="text-center">
        <Button
          type="text"
          sx={{
            color: "black",
            "&:hover": {
              color: "primary.dark",
            },
            width: "100%",
          }}
        >
          Home
        </Button>
      </Link>
      <Link
        to="/landlord/property/post"
        onClick={toggleMenu}
        className="text-center"
      >
        <Button
          type="text"
          sx={{
            color: "black",
            "&:hover": {
              color: "primary.dark",
            },
            width: "100%",
          }}
        >
          Post Property
        </Button>
      </Link>
      <Link
        to="/landlord/contacts/all"
        onClick={toggleMenu}
        className="text-center"
      >
        <Button
          type="text"
          sx={{
            color: "black",
            "&:hover": {
              color: "primary.dark",
            },
            width: "100%",
          }}
        >
          Contacts
        </Button>
      </Link>
      <Link to="/landlord/rentDetail" onClick={toggleMenu} className="text-center">
        <Button
          type="text"
          sx={{
            color: "black",
            "&:hover": {
              color: "primary.dark",
            },
            width: "100%",
          }}
        >
          Rent
        </Button>
      </Link>
      <Link
        to="/landlord/chat"
        onClick={toggleMenu}
        className="text-center relative"
      >
        <Button
          type="text"
          sx={{
            color: "black",
            "&:hover": {
              color: "primary.dark",
            },
            width: "100%",
            position: "relative",
          }}
        >
          Chat{" "}
          {unreadMessageCount > 0 && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs rounded-full">
              {unreadMessageCount}
            </div>
          )}
        </Button>
      </Link>
    </>
  );
};

const NavBarLinksTenant = ({ toggleMenu }) => {
  const { unreadMessageCount } = useContext(SocketContext);
  return (
    <>
      <Link to="/tenant/dashboard" onClick={toggleMenu} className="text-center">
        <Button
          type="text"
          sx={{
            color: "black",
            "&:hover": {
              color: "primary.dark",
            },
            width: "100%",
          }}
        >
          Home
        </Button>
      </Link>
      <Link
        to="/tenant/rental-properties/all"
        onClick={toggleMenu}
        className="text-center"
      >
        <Button
          type="text"
          sx={{
            color: "black",
            "&:hover": {
              color: "primary.dark",
            },
            width: "100%",
          }}
        >
          Rental Properties
        </Button>
      </Link>
      <Link
        to="/tenant/real-estate/saved/all"
        onClick={toggleMenu}
        className="text-center"
      >
        <Button
          type="text"
          sx={{
            color: "black",
            "&:hover": {
              color: "primary.dark",
            },
            width: "100%",
          }}
        >
          Saved
        </Button>
      </Link>
      <Link
        to="/tenant/contacts/all"
        onClick={toggleMenu}
        className="text-center"
      >
        <Button
          type="text"
          sx={{
            color: "black",
            "&:hover": {
              color: "primary.dark",
            },
            width: "100%",
          }}
        >
          Contacts
        </Button>
      </Link>
      <Link
        to="/tenant/chat"
        onClick={toggleMenu}
        className="text-center relative"
      >
        <Button
          type="text"
          sx={{
            color: "black",
            "&:hover": {
              color: "primary.dark",
            },
            width: "100%",
            position: "relative",
          }}
        >
          Chat{" "}
          {unreadMessageCount > 0 && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs rounded-full">
              {unreadMessageCount}
            </div>
          )}
        </Button>
      </Link>
    </>
  );
};

export { NavBarLinksOwner, NavBarLinksTenant };
