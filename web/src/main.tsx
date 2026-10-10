import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { CollectionProvider } from "./context/CollectionProvider";
import "./index.css";

const racine = document.getElementById("root");
if (racine === null) throw new Error("Élément #root introuvable");

createRoot(racine).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthProvider>
  <CollectionProvider>
    <App />
  </CollectionProvider>
</AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
  
);