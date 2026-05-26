import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n"; 
import { saveManager } from '@/utils/save/SaveManager';
import { initMemory } from '@/utils/memory';
import App from "./App.tsx";

async function bootstrap() {
    try {
        // 1. Initialize Saver (Adapter setup)
        await saveManager.init();
        
        // 2. Initialize Memory (Hydrate Cache from Physical Storage)
        // This MUST happen before App Provider renders to prevent race conditions
        await initMemory();
        
        // 3. Render
        createRoot(document.getElementById("root")!).render(<App />);
    } catch (e) {
        console.error('CRITICAL: App failed to bootstrap:', e);
        // Fallback render to at least show something? 
        // Or just let it fail.
    }
}

bootstrap();
