import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdDarkMode, MdLightMode, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext.jsx";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { baseURL } from "../config/AxiosHelper.js";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { getMessages } from "../services/RoomService.js";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    theme,
    toggleTheme,
    setRoomId,
    setCurrentUser,
    setConnected,
  } = useChatContext();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const maxInputHeight = 96;

  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [roomId, currentUser, connected]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const recentMessages = await getMessages(roomId);
        setMessages(recentMessages);
      } catch (error) {
        toast.error("Error loading messages!");
      }
    }
    if (connected) {
      loadMessages();
    }
  }, [connected, roomId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (connected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.style.height = "auto";
    const nextHeight = Math.min(inputRef.current.scrollHeight, maxInputHeight);
    inputRef.current.style.height = `${nextHeight}px`;
    inputRef.current.style.overflowY =
      inputRef.current.scrollHeight > maxInputHeight ? "auto" : "hidden";
  }, [input]);

  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);
      client.debug = () => {};
      client.connect({}, () => {
        setStompClient(client);
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };
    if (connected) {
      connectWebSocket();
    }
  }, [roomId]);

  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
        timeStamp: new Date().toISOString(),
      };
      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message),
      );
      setInput("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      return "U";
    }
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  const getAvatarColorClass = (name = "") => {
    const palette = [
      "bg-rose-700",
      "bg-blue-700",
      "bg-indigo-700",
      "bg-violet-700",
      "bg-fuchsia-700",
      "bg-emerald-700",
      "bg-teal-700",
      "bg-amber-700",
    ];
    const hash = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return palette[hash % palette.length];
  };

  const dateAndTime = (date) => {
    const parsedDate = date ? new Date(date) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }
    return parsedDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleLogout = () => {
    if (stompClient) {
      stompClient.disconnect();
    }
    setRoomId("");
    setCurrentUser("");
    setConnected(false);
    navigate("/");
  };

  return (
    <div
      className={
        isDark ? "bg-slate-900 min-h-screen" : "bg-slate-100 min-h-screen"
      }
    >
      <header
        className={`fixed top-0 left-0 right-0 z-10 text-white shadow-md ${
          isDark ? "bg-slate-700" : "bg-blue-600"
        }`}
      >
        <div className="w-full md:w-11/12 lg:w-2/3 mx-auto px-3 md:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="px-2 py-1 rounded-md bg-black/15">
            <h1 className="text-sm md:text-base font-sans">
              Room Id: <span>{roomId}</span>
            </h1>
          </div>
          <div className="px-2 py-1 rounded-md bg-black/15">
            <h1 className="text-sm md:text-base font-sans">
              User: <span>{currentUser}</span>
            </h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className={`mr-2 p-2 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 cursor-pointer ${
                isDark
                  ? "bg-slate-600 hover:bg-slate-500 focus:ring-slate-300"
                  : "bg-white/20 hover:bg-white/30 focus:ring-white/50"
              }`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <MdLightMode size={25} /> : <MdDarkMode size={25} />}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-sm font-sans hover:bg-red-700 hover:cursor-pointer px-3 py-2 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Leave Room
            </button>
          </div>
        </div>
      </header>

      <main
        ref={chatBoxRef}
        className={`chat-scrollbar pt-22 pb-28 md:pb-30 px-3 md:px-6 h-screen overflow-auto w-full md:w-11/12 lg:w-2/3 mx-auto ${
          isDark
            ? "bg-linear-to-tr from-slate-900 via-slate-800 to-slate-900"
            : "bg-linear-to-tr from-slate-200 via-sky-200 to-emerald-200"
        }`}
      >
        {messages.length === 0 && (
          <>
            <p
              className={`text-center mt-8 font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
            >
              No messages yet.
            </p>
            <p
              className={`text-center mt-2 font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
            >
              Start the conversation by sharing the room id with your friends.
            </p>
          </>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"} mb-2`}
          >
            <div
              className={`my-0.5 ${message.sender === currentUser ? "bg-emerald-600" : "bg-sky-600"} p-2.5 pr-4 md:pr-6 pt-1.5 max-w-[90%] sm:max-w-md shadow-sm ${message.sender === currentUser ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm"}`}
            >
              <div className="flex flex-row gap-2">
                <p
                  className={`h-8 border border-white/30 w-8 flex items-center justify-center text-white text-xs font-bold rounded-full ${getAvatarColorClass(message.sender)}`}
                  title={message.sender || "Unknown user"}
                >
                  {getInitials(message.sender)}
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-white/90">
                    ~ {message.sender}
                  </p>
                  <p className="text-sm leading-5 text-white font-medium mt-0.5 mb-1.5 wrap-break-word">
                    {message.content}
                  </p>
                  <p className="text-[11px] text-slate-100 font-medium">
                    {dateAndTime(message.timeStamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      <div className="fixed bottom-2 md:bottom-4 left-0 right-0 px-3 md:px-6">
        <div
          className={`h-full pr-2 md:pr-3 py-2.5 gap-2 md:gap-3 flex items-end justify-between w-full md:w-1/2 lg:w-1/2 mx-auto rounded-2xl shadow-lg ${
            isDark ? "bg-slate-700" : "bg-blue-600"
          }`}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            placeholder="Type Your Message here.."
            className="input-scrollbar px-3 mx-1 text-white placeholder:text-slate-100 py-1.5 min-h-10 max-h-24 w-full bg-transparent focus:outline-none resize-none overflow-y-auto leading-5"
          />
          <div className="flex gap-2">
            <button
              onClick={() => toast("Attachment feature coming soon")}
              className="bg-orange-400 h-10 w-10 flex justify-center items-center rounded-full hover:cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <MdAttachFile size={20} title="Attach File" />
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="bg-emerald-400 h-10 w-10 flex justify-center items-center rounded-full hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <MdSend size={20} title="Send Message" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
