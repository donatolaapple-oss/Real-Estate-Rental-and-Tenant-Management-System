import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import VirtualTour from "./VirtualTour";

/**
 * Quick property modal: 360° + primary actions (used from dashboards).
 */
export default function PropertyModal({ open, onClose, property }) {
  if (!property) return null;
  const panUrl = property.panorama
    ? property.panorama.startsWith("http")
      ? property.panorama
      : `${window.location.origin}${property.panorama.startsWith("/") ? "" : "/"}${property.panorama}`
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        <span className="pr-8 line-clamp-1">{property.name}</span>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className="space-y-4">
        {panUrl ? (
          <VirtualTour panorama={panUrl} />
        ) : (
          <p className="text-sm text-slate-600">No 360° panorama URL for this listing yet.</p>
        )}
        <p className="text-slate-700">
          ₱{property.price?.toLocaleString?.()} / mo · {property.location || property.city || "Tupi"}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/property/${property._id}`}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium"
            onClick={onClose}
          >
            Full details
          </Link>
          <Link
            to="/tenant/chat"
            state={{ openChatWithLandlord: property.landlordId }}
            className="px-4 py-2 rounded-lg border border-indigo-200 text-indigo-700 text-sm font-medium"
            onClick={onClose}
          >
            Message landlord
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
