import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addTenantRecentMessage,
  getTenantChats,
  markChatAsRead,
} from "../../features/tenantUser/tenantUserSlice";
import { PageLoading, ChatUsers, ChatMessages, Logo } from "../../components";
import { SocketContext } from "../../utils/SocketContext";
import axiosFetch from "../../utils/axiosCreate";
import { TenantRoleNavbar } from "../../components/RoleNavbar";

/**
 * Tenant ↔ landlord messaging. MongoDB + Socket.io.
 */
export default function TenantChatPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { chats, isLoading } = useSelector((state) => state.tenantUser);
  const { user } = useSelector((state) => state.auth);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentSelectedChatIndex, setCurrentChatIndex] = useState(null);
  const { socketMessage } = useContext(SocketContext);

  const loadChats = useCallback(() => {
    dispatch(getTenantChats());
  }, [dispatch]);

  const handleCurrentChatChange = useCallback(
    (chat) => {
      setCurrentChat(chat);
      setCurrentChatIndex(chat?._id);
      dispatch(markChatAsRead({ chatId: chat?._id }));
    },
    [dispatch]
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    const landlordId = location.state?.openChatWithLandlord;
    if (!landlordId || !user?._id) return;

    (async () => {
      try {
        const { data } = await axiosFetch.get("/tenant/profile");
        const contacts = data?.user?.contacts || [];
        const has = contacts.some((c) => c.toString() === landlordId.toString());
        if (!has) {
          await axiosFetch.patch(`/tenant/addContact/${landlordId}`);
        }
        await dispatch(getTenantChats()).unwrap();
        const list = await axiosFetch.get("/chat/tenant/get-chats");
        const chatList = list.data?.chats || [];
        const partner = chatList.find(
          (ch) =>
            ch._id?.toString() === landlordId.toString() ||
            (ch.to && ch.to.toString() === landlordId.toString())
        );
        if (partner) {
          setCurrentChat(partner);
          setCurrentChatIndex(partner._id);
        } else {
          const { data: ld } = await axiosFetch.get(`/tenant/landlord/${landlordId}`);
          const landlord = ld.landlord;
          setCurrentChat({
            _id: landlord._id,
            firstName: landlord.firstName,
            lastName: landlord.lastName,
            profileImage: landlord.profileImage,
            slug: landlord.slug,
          });
          setCurrentChatIndex(landlord._id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [location.state, user?._id, dispatch]);

  useEffect(() => {
    if (location.state && !location.state.openChatWithLandlord && location.state._id) {
      handleCurrentChatChange(location.state);
    }
  }, [location.state, handleCurrentChatChange]);

  useEffect(() => {
    if (socketMessage) {
      dispatch(
        addTenantRecentMessage({
          chatId: socketMessage?.from,
          message: socketMessage?.message,
          sender: socketMessage?.from,
        })
      );
    }
  }, [socketMessage, dispatch]);

  const sidebarChats = useMemo(() => {
    const list = chats || [];
    if (!currentChat) return list;
    const exists = list.some((c) => c._id?.toString() === currentChat._id?.toString());
    if (exists) return list;
    return [currentChat, ...list];
  }, [chats, currentChat]);

  if (isLoading && !chats) {
    return <PageLoading />;
  }

  const hasList = chats?.length > 0;
  const showComposer = currentChat != null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-b">
        <div className="flex items-center gap-3">
          <Logo />
          <Link to="/tenant/dashboard" className="text-sm text-indigo-600">
            ← Dashboard
          </Link>
        </div>
        <TenantRoleNavbar />
      </header>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-heading font-bold text-xl">Messages</h2>
          <Link
            to="/tenant/dashboard"
            className="inline-flex items-center rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50"
          >
            Start new chat from a listing
          </Link>
        </div>
        {!hasList && !showComposer ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-600 mb-4">
              No conversations yet. Open a property and use &quot;Message landlord&quot; to start.
            </p>
            <Link to="/tenant/dashboard" className="text-indigo-600 font-medium hover:underline">
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="flex gap-4" style={{ maxHeight: "520px" }}>
            <div className="flex flex-col gap-2 w-full sm:w-1/3 overflow-y-auto min-h-[320px]">
              {sidebarChats?.map((chat) => (
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
            <div className="flex-1 border rounded-lg bg-white p-2 min-h-[320px]">
              {!showComposer ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-slate-500">Select a conversation or open chat from a listing</p>
                </div>
              ) : (
                <ChatMessages
                  chat={currentChat}
                  currentUser={user}
                  fromTenant
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
