import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "./context/ChatContext.jsx";
import ChatPage from "./components/ChatPage.jsx";
import JoinCreateChat from "./components/JoinCreateChat.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster position="top-center" />
    <ChatProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/joincreatechat" element={<JoinCreateChat />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </ChatProvider>
  </BrowserRouter>,
);
