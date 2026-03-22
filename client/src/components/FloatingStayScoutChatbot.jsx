import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EnhancedChatbot from "./EnhancedChatbot";

/**
 * Floating purple FAB + expandable panel (matches modern SaaS chatbot placement).
 */
export default function FloatingStayScoutChatbot({ disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-4 z-[1000] w-[min(100vw-2rem,400px)] max-h-[min(70vh,520px)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-indigo-900/10 flex flex-col"
          role="dialog"
          aria-label="StayScout assistant"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <div>
              <p className="text-sm font-semibold">StayScout assistant</p>
              <p className="text-[11px] text-indigo-100">Compare listings &amp; budgets</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10"
              aria-label="Close chat"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-3">
            <EnhancedChatbot disabled={disabled} />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-4 z-[1001] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-transform"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
      </button>
    </>
  );
}
