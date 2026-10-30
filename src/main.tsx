import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { applyLightTheme } from "./hooks/useTheme.ts";

// Single light theme: pin the document scheme before the first render.
applyLightTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>,
);
