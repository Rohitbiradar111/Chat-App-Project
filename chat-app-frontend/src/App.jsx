import "./App.css";
import { useNavigate } from "react-router";
import useChatContext from "./context/ChatContext";
import { BsArrowRight, BsLightningChargeFill } from "react-icons/bs";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { FiZap, FiShield, FiMessageSquare } from "react-icons/fi";

function App() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useChatContext();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white select-none ${
        isDark
          ? "bg-[#0B0F19] text-slate-100 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,70,229,0.15),transparent)]"
          : "bg-slate-50 text-slate-900 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.10),transparent)]"
      }`}
    >
      <nav className="w-full flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 sm:py-5 shrink-0">
        <div className="flex items-center">
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
          className={`p-2 rounded-full transition-colors focus:outline-none cursor-pointer ${
            isDark
              ? "bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-300"
              : "bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-400"
          }`}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>
      </nav>

      <main className="flex-1 px-1 sm:px-6 md:px-12 py-2 sm:py-6">
        <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-2 pb-14 md:pt-4 md:pb-20">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-[1.65rem] xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6 text-center">
              <span className="block whitespace-nowrap sm:whitespace-normal">
                Chat in{" "}
                <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-sky-400 dark:via-indigo-300 dark:to-emerald-400 bg-clip-text text-transparent">
                  real-time
                </span>
                ,
              </span>
              <span className="block whitespace-nowrap sm:whitespace-normal">
                without the friction.
              </span>
            </h1>
            <div
              className={`text-xs sm:text-base lg:text-lg max-w-2xl mb-8 leading-relaxed flex flex-col gap-1 sm:gap-1.5 text-center ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              <p>BoltChat delivers lightning-fast, zero-setup messaging rooms.</p>
              <p>No signups, no phone numbers, and no data harvesting.</p>
              <p>Just share a Room ID and converse effortlessly.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-12">
              <button
                onClick={() => navigate("/joincreatechat")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600 text-white font-bold text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Start Conversation Now</span>
                <BsArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("features");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-base border transition-all duration-200 cursor-pointer ${
                  isDark
                    ? "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-200"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs"
                }`}
              >
                Explore Features
              </button>
            </div>

            <div className="w-full max-w-4xl mx-auto">
              <div
                className={`relative rounded-2xl overflow-hidden border shadow-2xl ${
                  isDark
                    ? "bg-slate-900 border-slate-800 shadow-black/50"
                    : "bg-white border-slate-200 shadow-slate-200"
                }`}
              >
                <div
                  className={`px-4 py-3 flex items-center border-b ${
                    isDark
                      ? "bg-slate-800/80 border-slate-700/80"
                      : "bg-slate-100/90 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/90" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
                  </div>
                </div>

                <div className="relative aspect-video w-full overflow-hidden bg-black/10">
                  <video
                    src="/videos/hero_video.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload noplaybackrate"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className={`py-20 border-t ${
            isDark
              ? "bg-slate-950/40 border-slate-800/80"
              : "bg-slate-100/50 border-slate-200/80"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                Why BoltChat?
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Fast, simple, and private messaging.
              </p>
              <p
                className={`text-base sm:text-lg ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Everything you need to talk with your friends or team without
                any complicated setup.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div
                className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? "bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-lg"
                    : "bg-white border-slate-200 hover:border-blue-200 shadow-md hover:shadow-xl"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                  <FiZap size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Messaging</h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Send and receive messages immediately with no delays. As soon
                  as you hit send, everyone in the room sees it.
                </p>
              </div>

              <div
                className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? "bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-lg"
                    : "bg-white border-slate-200 hover:border-indigo-200 shadow-md hover:shadow-xl"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                  <FiShield size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">No Sign-Up Needed</h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  No accounts, passwords, or emails. Simply pick any nickname,
                  enter a Room ID, and start chatting right away.
                </p>
              </div>

              <div
                className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? "bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-lg"
                    : "bg-white border-slate-200 hover:border-emerald-200 shadow-md hover:shadow-xl"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                  <FiMessageSquare size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Clean & Easy to Use</h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  A smooth and responsive design that works easily on both
                  mobiles and desktops, with built-in dark and light modes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">
              Up and chatting in 3 easy steps
            </h2>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              Simple enough for anyone, powerful enough for real-time teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`p-6 rounded-2xl border ${
                isDark
                  ? "bg-slate-900/40 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="text-3xl font-black text-indigo-500/40 mb-3">
                01
              </div>
              <h4 className="text-lg font-bold mb-1">Pick a Nickname</h4>
              <p
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Enter whatever name you’d like your peers in the room to see.
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl border ${
                isDark
                  ? "bg-slate-900/40 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="text-3xl font-black text-blue-500/40 mb-3">
                02
              </div>
              <h4 className="text-lg font-bold mb-1">Create or Join a Room</h4>
              <p
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Specify a unique Room ID to launch a new room, or join an
                existing one.
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl border ${
                isDark
                  ? "bg-slate-900/40 border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="text-3xl font-black text-emerald-500/40 mb-3">
                03
              </div>
              <h4 className="text-lg font-bold mb-1">Chat in Real-Time</h4>
              <p
                className={`text-sm ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Exchange messages instantaneously with full history persistence.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div
            className={`p-8 sm:p-12 rounded-3xl border relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 ${
              isDark
                ? "bg-linear-to-r from-indigo-950/60 via-slate-900 to-slate-900 border-indigo-900/50 shadow-2xl"
                : "bg-linear-to-r from-blue-600 to-indigo-700 border-transparent text-white shadow-xl shadow-indigo-600/20"
            }`}
          >
            <div className="max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                Ready to start chatting?
              </h3>
            </div>

            <button
              onClick={() => navigate("/joincreatechat")}
              className={`px-8 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap shadow-lg flex items-center gap-2 ${
                isDark
                  ? "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-500/30"
                  : "bg-white text-blue-600 hover:bg-slate-100 shadow-black/10"
              }`}
            >
              <span>Launch BoltChat</span>
              <BsArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
