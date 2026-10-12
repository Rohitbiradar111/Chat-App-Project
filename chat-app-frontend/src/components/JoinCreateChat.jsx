import { useState } from "react";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { BsLightningChargeFill } from "react-icons/bs";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const { setRoomId, setCurrentUser, setConnected, theme, toggleTheme } =
    useChatContext();
  const isDark = theme === "dark";

  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (!detail.roomId.trim() || !detail.userName.trim()) {
      toast.error("Name and Room Id cannot be empty!", { duration: 5000 });
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const cleanRoomId = detail.roomId.trim();
        const cleanUserName = detail.userName.trim();
        const room = await joinChatApi(cleanRoomId);
        toast.success("Successfully Joined Room", { duration: 5000 });
        setCurrentUser(cleanUserName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        const errorMsg =
          error.response?.data?.message ||
          (typeof error.response?.data === "string" ? error.response.data : null) ||
          "Room Not Found! Please check the Room ID.";
        toast.error(errorMsg, { duration: 5000 });
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const cleanRoomId = detail.roomId.trim();
        const cleanUserName = detail.userName.trim();
        const response = await createRoomApi(cleanRoomId);
        toast.success("Room Created Successfully!", { duration: 5000 });
        setCurrentUser(cleanUserName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        const errorMsg =
          error.response?.data?.message ||
          (typeof error.response?.data === "string" ? error.response.data : null) ||
          "Error creating room. Please try again.";
        toast.error(errorMsg, { duration: 5000 });
      }
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 relative selection:bg-indigo-500 selection:text-white select-none ${
        isDark
          ? "bg-[#0B0F19] text-slate-100 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,70,229,0.15),transparent)]"
          : "bg-slate-50 text-slate-900 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.10),transparent)]"
      }`}
    >
      <div
        onClick={() => navigate("/")}
        className="absolute top-4 sm:top-5 left-4 sm:left-6 md:left-12 flex items-center cursor-pointer select-none"
      >
        <div
          className={`w-8 h-8 flex items-center justify-center ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          <BsLightningChargeFill size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight italic">BoltChat</span>
      </div>

      <button
        onClick={toggleTheme}
        className={`absolute top-4 sm:top-5 right-4 sm:right-6 md:right-12 p-2 rounded-full transition-colors focus:outline-none cursor-pointer ${
          isDark
            ? "bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-300"
            : "bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-400"
        }`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </button>

      <div
        className={`p-6 sm:p-8 w-full flex flex-col gap-6 max-w-md rounded-3xl border shadow-2xl transition-all ${
          isDark
            ? "bg-slate-900/90 border-slate-800 text-white shadow-black/50"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-200"
        }`}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Join or Create a Room
          </h1>
          <p
            className={`text-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Enter your name and a room id to get started.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="userName"
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Name
            </label>
            <input
              onChange={handleFormInputChange}
              value={detail.userName}
              type="text"
              id="userName"
              name="userName"
              placeholder="Enter Your Name"
              className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-sm ${
                isDark
                  ? "bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="roomId"
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Room ID
            </label>
            <input
              name="roomId"
              value={detail.roomId}
              placeholder="Enter Room ID"
              onChange={handleFormInputChange}
              type="text"
              id="roomId"
              className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-sm ${
                isDark
                  ? "bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
          <button
            onClick={joinChat}
            className="px-5 py-3 w-full sm:w-1/2 bg-linear-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600 text-white rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-md shadow-indigo-600/25"
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="px-5 py-3 w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer shadow-md shadow-emerald-600/25"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
