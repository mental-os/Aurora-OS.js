import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n"; // Initialize i18n (custom module)
import { initStorageObserver } from "./utils/memory";
import App from "./App.tsx";

initStorageObserver();

createRoot(document.getElementById("root")!).render(<App />);
