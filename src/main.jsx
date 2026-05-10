import { HeroUIProvider } from "@heroui/react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <HeroUIProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </HeroUIProvider>
);
