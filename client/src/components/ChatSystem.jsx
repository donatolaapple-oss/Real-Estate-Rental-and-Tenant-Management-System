import { Link } from "react-router-dom";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

/**
 * Entry point UI for tenant↔landlord messaging (backed by /api/chat + Socket.IO).
 */
export default function ChatSystem({ role = "tenant", className = "" }) {
  const to = role === "landlord" ? "/landlord/chat" : "/tenant/chat";
  return (
    <div className={`rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 text-slate-800 font-semibold">
        <ChatBubbleOutlineIcon className="text-indigo-600" />
        Messages
      </div>
      <p className="text-sm text-slate-600 mt-1">
        Chat is stored in MongoDB and delivered in real time when you are online.
      </p>
      <Link
        to={to}
        className="inline-flex mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
      >
        Open inbox
      </Link>
    </div>
  );
}
