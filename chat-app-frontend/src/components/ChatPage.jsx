import { useEffect, useRef, useState } from "react";
import {
  MdAttachFile,
  MdDarkMode,
  MdLightMode,
  MdSend,
  MdContentCopy,
  MdClose,
} from "react-icons/md";
import { BsLightningChargeFill } from "react-icons/bs";
import { GoSignOut } from "react-icons/go";
import useChatContext from "../context/ChatContext.jsx";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { baseURL } from "../config/AxiosHelper.js";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { getMessages, getRoomAiSummaryApi } from "../services/RoomService.js";

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
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);
  const maxInputHeight = 96;

  const handleOpenAiSummary = async () => {
    setShowAiModal(true);
    setIsLoadingAi(true);
    setAiSummary("");
    try {
      const res = await getRoomAiSummaryApi(roomId);
      setAiSummary(res.summary || "No summary available.");
    } catch {
      toast.error("Failed to generate AI summary.");
      setAiSummary("Could not load summary. Please try again.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopyAiSummary = async () => {
    if (!aiSummary) return;
    try {
      await navigator.clipboard.writeText(aiSummary);
      toast.success("AI Summary copied to clipboard!");
    } catch {
      toast.error("Failed to copy summary.");
    }
  };

  const roomUsers = Array.from(
    new Set([currentUser, ...messages.map((m) => m.sender).filter(Boolean)])
  );

  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [roomId, currentUser, connected, navigate]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const recentMessages = await getMessages(roomId);
        setMessages(recentMessages);
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Error loading messages!";
        toast.error(errorMsg, { duration: 5000 });
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
    let client = null;
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      client = Stomp.over(sock);
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
    return () => {
      if (client && client.connected) {
        client.disconnect();
      }
    };
  }, [connected, roomId]);

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

  const formatDate = (date) => {
    const parsedDate = date ? new Date(date) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }
    const today = new Date();
    const isToday =
      parsedDate.getDate() === today.getDate() &&
      parsedDate.getMonth() === today.getMonth() &&
      parsedDate.getFullYear() === today.getFullYear();
    if (isToday) {
      return "Today";
    }
    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    const parsedDate = date ? new Date(date) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }
    return parsedDate.toLocaleTimeString("en-US", {
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
      className={`h-screen w-full flex flex-col md:flex-row overflow-hidden selection:bg-indigo-500 selection:text-white ${
        isDark
          ? "bg-[#0B0F19] text-slate-100 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,70,229,0.15),transparent)]"
          : "bg-slate-50 text-slate-900 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.10),transparent)]"
      }`}
    >
      <aside
        className={`hidden md:flex md:w-56 lg:w-60 h-screen flex-col justify-between shrink-0 border-r z-20 transition-colors ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900 shadow-xs"
        }`}
      >
        <div className="p-3.5 flex flex-col gap-4 overflow-y-auto chat-scrollbar flex-1 min-h-0">
          <div
            onClick={() => navigate("/")}
            className="flex items-center justify-center cursor-pointer select-none px-1"
          >
            <div
              className={`w-7 h-7 flex items-center justify-center ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              <BsLightningChargeFill size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight italic">
              BoltChat
            </span>
          </div>

          <div
            className={`w-full px-3 py-1.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              isDark
                ? "bg-slate-800/80 border-slate-700/80 text-slate-200"
                : "bg-slate-100/90 border-slate-200 text-slate-700"
            }`}
          >
            <span>
              Room ID :{" "}
              <span className="font-bold text-emerald-500">{roomId}</span>
            </span>
          </div>

          <button
            onClick={handleOpenAiSummary}
            className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30"
                : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <BsLightningChargeFill size={14} className="text-emerald-500" />
            <span>AI Summary</span>
          </button>

          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between px-1">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Members in this chat
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {roomUsers.length}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {roomUsers.map((user, idx) => (
                <div
                  key={idx}
                  className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors ${
                    isDark
                      ? "bg-slate-800/60 border-slate-700/60 text-slate-200"
                      : "bg-slate-100/80 border-slate-200 text-slate-700"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${getAvatarColorClass(
                      user
                    )}`}
                  >
                    {getInitials(user)}
                  </div>
                  <span className="truncate flex-1 font-semibold">{user}</span>
                  {user === currentUser && (
                    <span className="text-[9px] text-emerald-400 font-bold">
                      (You)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`p-3 border-t flex items-center gap-2 ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-colors focus:outline-none cursor-pointer shrink-0 border ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
            }`}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <MdLightMode size={16} /> : <MdDarkMode size={16} />}
          </button>

          <button
            onClick={handleLogout}
            className="flex-1 py-2 px-3 rounded-xl font-semibold text-xs bg-rose-600 hover:bg-rose-700 text-white transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-rose-600/20"
          >
            <GoSignOut size={20} />
            <span>Leave Room</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        <header
          className={`md:hidden shrink-0 z-20 transition-colors border-b p-2 flex flex-col gap-1.5 ${
            isDark
              ? "bg-slate-900 border-slate-800 text-slate-100"
              : "bg-white border-slate-200 text-slate-900 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 w-full">
            <div
              className={`max-w-[75%] min-w-0 px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isDark
                  ? "bg-slate-800/80 border-slate-700/80 text-slate-200"
                  : "bg-slate-100/90 border-slate-200 text-slate-700"
              }`}
            >
              <span className="shrink-0">Room ID:</span>
              <span className="font-bold text-emerald-500 truncate" title={roomId}>{roomId}</span>
            </div>

            <div
              className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition-colors ${
                isDark
                  ? "bg-slate-800/80 border-slate-700/80 text-slate-200"
                  : "bg-slate-100/90 border-slate-200 text-slate-700"
              }`}
              title={`Members: ${roomUsers.join(", ")}`}
            >
              <span>Users:</span>
              <span className="font-bold text-emerald-500">{roomUsers.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 w-full">
            <button
              onClick={handleOpenAiSummary}
              className={`w-full px-2 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                isDark
                  ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <span>AI Summary</span>
            </button>

            <button
              onClick={toggleTheme}
              className={`w-full px-2 py-1.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1 transition-colors focus:outline-none cursor-pointer ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
              }`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <MdLightMode size={14} /> : <MdDarkMode size={14} />}
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-2 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors duration-150 cursor-pointer shadow-sm shadow-rose-600/20 active:scale-98"
            >
              <GoSignOut size={14} />
              <span>Leave</span>
            </button>
          </div>
        </header>

        <main
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto chat-scrollbar px-3 md:px-8 pt-3 md:pt-6 pb-26 md:pb-24 transition-colors"
        >
          {messages.length === 0 && (
            <div className="text-center mt-20 px-4">
              <p
                className={`text-base font-semibold mb-1 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                No messages yet
              </p>
              <p
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Start the conversation by sharing room ID{" "}
                <span className="font-mono font-bold text-emerald-500">
                  {roomId}
                </span>{" "}
                with your friends.
              </p>
            </div>
          )}

          {messages.map((message, index) => {
            const isMe = message.sender === currentUser;
            const msgDate = formatDate(message.timeStamp);
            const prevMsg = messages[index - 1];
            const isNewDay =
              !prevMsg || formatDate(prevMsg.timeStamp) !== msgDate;

            return (
              <div key={index} className="w-full flex flex-col mb-3">
                {isNewDay && (
                  <div className="flex justify-center my-3">
                    <span
                      className={`text-[11px] font-semibold px-3 py-1 rounded-full border shadow-xs ${
                        isDark
                          ? "bg-slate-800 text-slate-300 border-slate-700"
                          : "bg-slate-200 text-slate-700 border-slate-300"
                      }`}
                    >
                      {msgDate}
                    </span>
                  </div>
                )}

                <div
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`p-3 pr-4 md:pr-5 pt-2 max-w-[85%] sm:max-w-md shadow-md ${
                      isMe
                        ? "bg-[#005c4b] text-white rounded-2xl rounded-tr-none"
                        : isDark
                        ? "bg-[#202c33] text-white rounded-2xl rounded-tl-xs border border-slate-700/80 shadow-lg ring-1 ring-white/10"
                        : "bg-black text-white rounded-2xl rounded-tl-xs border border-zinc-800 shadow-lg"
                    }`}
                  >
                    <div className="flex flex-row gap-2.5">
                      {!isMe && (<p
                        className={`h-8 w-8 shrink-0 border border-white/30 flex items-center justify-center text-white text-xs font-bold rounded-full ${getAvatarColorClass(
                          message.sender
                        )}`}
                        title={message.sender || "Unknown user"}
                      >
                        {getInitials(message.sender)}
                      </p>)}
                      <div className="flex flex-col min-w-0 flex-1">
                        {!isMe && (
                          <p className="text-xs font-bold text-sky-400 mb-0.5">
                            ~ {message.sender}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed font-normal wrap-break-word text-white">
                          {message.content}
                        </p>
                        <div className="flex items-center justify-end mt-1 text-[10px] text-white font-medium">
                          <span>{formatTime(message.timeStamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        <div className="absolute bottom-2 md:bottom-4 left-0 right-0 px-3 md:px-6 z-10">
          <div
            className={`pr-2 md:pr-3 py-2 gap-2 md:gap-3 flex items-end justify-between w-full max-w-3xl mx-auto rounded-4xl border bg-black text-white`}
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
              placeholder="Type a message..."
              className={`input-scrollbar px-3 mx-1 py-2 min-h-10 max-h-24 w-full bg-transparent focus:outline-none resize-none overflow-y-auto text-sm leading-5 text-white placeholder:text-slate-400`}
            />
            <div className="flex gap-2 shrink-0 pb-0.5">
              <button
                onClick={() => toast("Attachment feature coming soon",{duration:5000, icon:(<MdAttachFile size={20}/>) })}
                className={`h-9 w-9 flex justify-center items-center rounded-4xl border cursor-pointer focus:outline-none text-white`}
                title="Attach File"
              >
                <MdAttachFile size={20} />
              </button>
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-[#25D366] text-white h-9 w-9 flex justify-center items-center rounded-xl transition-all duration-150 focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                title="Send Message"
              >
                <MdSend size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-2xl p-5 border shadow-2xl transition-all flex flex-col max-h-[85vh] ${
              isDark
                ? "bg-slate-900 border-slate-500 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl">
                  <BsLightningChargeFill size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold">BoltChat AI Summary</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Room: <span className="font-semibold text-emerald-500">{roomId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <MdClose size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto chat-scrollbar pr-2 py-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {isLoadingAi ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500 dark:text-slate-400">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-medium">BoltChat AI is analyzing your conversation...</p>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-xl border ${
                    isDark
                      ? "bg-slate-950/60 border-slate-800 text-slate-200"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  {aiSummary}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 gap-2">
              <button
                type="button"
                onClick={handleOpenAiSummary}
                disabled={isLoadingAi}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isDark
                    ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50`}
              >
                <span>Regenerate</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    isDark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCopyAiSummary}
                  disabled={isLoadingAi || !aiSummary}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  <MdContentCopy size={13} />
                  <span>Copy Summary</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
