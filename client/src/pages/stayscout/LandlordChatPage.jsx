import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addOwnerRecentMessage,
  getOwnerChats,
  markChatAsRead,
} from "../../features/ownerUser/ownerUserSlice";
import { PageLoading, ChatUsers, ChatMessages, Logo } from "../../components";
import { socket } from "../../socket";
import { SocketContext } from "../../utils/SocketContext";

export default function LandlordChatPage() {
  const dispatch = useDispatch();
  const { chats, isLoading } = useSelector((state) => state.ownerUser);
  const { user } = useSelector((state) => state.auth);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentSelectedChatIndex, setCurrentChatIndex] = useState(null);
  const { socketMessage } = useContext(SocketContext);

  useEffect(() => {
    dispatch(getOwnerChats());
  }, [dispatch]);

  useEffect(() => {
    if (socketMessage) {
      dispatch(
        addOwnerRecentMessage({
          chatId: socketMessage?.from,
          message: socketMessage?.message,
          sender: socketMessage?.from,
        })
      );
    }
  }, [socketMessage, dispatch]);

  const handleCurrentChatChange = (chat) => {
    socket?.emit("markAsRead", {
      receiverID: user?._id,
      senderId: chat?._id,
    });
    setCurrentChat(chat);
    setCurrentChatIndex(chat?._id);
    dispatch(markChatAsRead({ chatId: chat?._id }));
  };

  if (isLoading && !chats) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <div className="flex items-center gap-3">
          <Logo />
          <Link to="/landlord/dashboard" className="text-sm text-indigo-600">
            ← Dashboard
          </Link>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-heading font-bold text-xl">Chat with tenants</h2>
          <Link
            to="/landlord/dashboard"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Back to listings
          </Link>
        </div>
        {!chats?.length ? (
          <p className="text-center text-slate-600">
            No conversations yet. Tenants message you from property pages.
          </p>
        ) : (
          <div className="flex gap-4" style={{ maxHeight: "520px" }}>
            <div className="flex flex-col gap-2 w-1/3 overflow-y-auto">
              {chats?.map((chat) => (
                <div key={chat?._id} onClick={() => handleCurrentChatChange(chat)} role="presentation">
                  <div
                    className={`${
                      currentSelectedChatIndex === chat?._id ? "bg-slate-200" : ""
                    } rounded-md p-2 cursor-pointer`}
                  >
                    <ChatUsers chat={chat} currentUser={user} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1 border rounded-lg bg-white p-2">
              {currentChat == null ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-slate-500">Select a conversation</p>
                </div>
              ) : (
                <ChatMessages
                  chat={currentChat}
                  currentUser={user}
                  fromTenant={false}
                  handleCurrentChatChange={handleCurrentChatChange}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
