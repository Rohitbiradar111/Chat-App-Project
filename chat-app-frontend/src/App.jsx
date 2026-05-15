import "./App.css";
import { BsChatSquareText } from "react-icons/bs";
import { IoIosArrowRoundForward } from "react-icons/io";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useNavigate } from "react-router";
import useChatContext from "./context/ChatContext";

function App() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useChatContext();
  const isDark = theme === "dark";

  return (
    <div
      className={`h-screen flex flex-col overflow-x-hidden overflow-y-auto lg:overflow-hidden ${
        isDark ? "bg-slate-900 text-white" : "bg-blue-600 text-white"
      }`}
    >
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 shrink-0">
        <div className="flex items-center gap-2 mx-auto lg:mx-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? "bg-slate-700" : "bg-black"
            }`}
          >
            <BsChatSquareText size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">BoltChat</span>
        </div>
        <button
          onClick={toggleTheme}
          className={`absolute right-6 md:right-12 p-2 rounded-full transition-colors focus:outline-none cursor-pointer ${
            isDark
              ? "bg-slate-700 hover:bg-slate-600 focus:ring-slate-300"
              : "bg-white/20 hover:bg-white/30 focus:ring-white/50"
          }`}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? <MdLightMode size={25} /> : <MdDarkMode size={25} />}
        </button>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row max-w-360 mx-auto w-full items-center">
        <section className="flex-1 px-6 md:px-12 py-4 lg:py-0 text-center lg:text-left">
          <div className="max-w-xl mx-auto lg:mx-0">
            <h1 className="text-4xl md:text-6xl italic font-extrabold tracking-tight leading-tight mb-4">
              Chat in{" "}
              <span
                className={
                  isDark
                    ? "text-sky-300 not-italic"
                    : "text-yellow-400 not-italic"
                }
              >
                real-time
              </span>
              , without the lag.
            </h1>
            <p className="text-lg font-bold text-white mb-1 leading-relaxed">
              BoltChat provides lightning-fast messaging.
            </p>
            <p className="text-lg font-bold text-white mb-6 leading-relaxed">
              Get Started By Joining an Existing Room{" "}
              <span
                className={
                  isDark ? "italic text-sky-300" : "italic text-yellow-400"
                }
              >
                OR
              </span>{" "}
              By Creating a New Room.
            </p>

            <div className="flex justify-center lg:justify-start">
              <button
                className="w-full sm:w-auto px-8 py-3 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-500 hover:text-white flex justify-center items-center gap-1 transition-colors cursor-pointer"
                onClick={() => navigate("/joincreatechat")}
              >
                Start Your Conversation Today
                <IoIosArrowRoundForward size={40} />
              </button>
            </div>

            <div className="ml-4 mt-1 flex items-center justify-center lg:justify-start gap-2 text-sm text-white">
              <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
              <p>No Signup Required. Privacy Focused.</p>
            </div>
          </div>
        </section>

        <section className="flex-1 flex items-center justify-center p-6 md:p-12 w-full">
          <div className="relative w-full max-w-md lg:max-w-lg">
            <div className="absolute inset-0 bg-green-100 rounded-3xl blur-3xl opacity-50 animate-pulse" />
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
              className="relative w-full h-[30vh] md:h-[40vh] lg:h-[50vh] object-cover rounded-3xl shadow-2xl border-4 border-white/80"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
