import React, { useState } from "react";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import { MdDarkMode, MdLightMode } from "react-icons/md";

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
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Name and Room Id cannot be empty!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("Successfully Joined Room");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status === 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Error in Joining Room, Please try again later.");
        }
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const response = await createRoomApi(detail.roomId);
        toast.success("Room Created Successfully!");
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status === 400) {
          toast.error("This Room Id Already Exists!");
        } else {
          toast.error("Error in creating room, Please try again later.");
        }
      }
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-3 relative ${
        isDark ? "bg-slate-900" : "bg-blue-600"
      }`}
    >
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 cursor-pointer ${
          isDark
            ? "bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-300"
            : "bg-white/20 text-white hover:bg-white/30 focus:ring-white/50"
        }`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? <MdLightMode size={25} /> : <MdDarkMode size={25} />}
      </button>
      <div
        className={`p-6 md:p-8 w-full flex flex-col gap-5 max-w-md rounded-3xl shadow-2xl ${
          isDark
            ? "bg-slate-900 border border-slate-700 text-white"
            : "bg-white text-slate-900"
        }`}
      >
        <h1 className="text-xl md:text-2xl font-semibold text-center flex justify-center items-center">
          Join a Room / Create a Room
        </h1>
        <div>
          <label htmlFor="userName" className="block font-medium mb-2">
            Name :
          </label>
          <input
            onChange={handleFormInputChange}
            value={detail.userName}
            type="text"
            id="userName"
            name="userName"
            placeholder="Enter Your Name"
            className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
              isDark
                ? "bg-slate-700 text-white placeholder:text-slate-300"
                : "bg-slate-100 text-slate-900 placeholder:text-slate-500"
            }`}
          />
        </div>

        <div className="">
          <label htmlFor="roomId" className="block font-medium mb-2">
            Room Id :
          </label>
          <input
            name="roomId"
            value={detail.roomId}
            placeholder="Enter Room Id"
            onChange={handleFormInputChange}
            type="text"
            id="roomId"
            className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
              isDark
                ? "bg-slate-700 text-white placeholder:text-slate-300"
                : "bg-slate-100 text-slate-900 placeholder:text-slate-500"
            }`}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between mt-4 gap-3">
          <button
            onClick={joinChat}
            className={`px-4 py-2.5 w-full sm:w-auto bg-blue-500 hover:bg-blue-700 hover:cursor-pointer rounded-full font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${
              isDark
                ? "focus:ring-offset-slate-900"
                : "focus:ring-offset-white text-white"
            }`}
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className={`px-4 py-2.5 w-full sm:w-auto bg-emerald-500 hover:bg-emerald-700 hover:cursor-pointer rounded-full font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 ${
              isDark
                ? "focus:ring-offset-slate-900"
                : "focus:ring-offset-white text-white"
            }`}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
