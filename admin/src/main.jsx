import App from "./App.jsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SidebarProvider } from "./context/SidebarProvider.jsx";
import { store } from "./app/store.js";
import { Provider } from "react-redux";
import axios from "axios";
import "./index.css";

axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SidebarProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </SidebarProvider>
  </StrictMode>
);
