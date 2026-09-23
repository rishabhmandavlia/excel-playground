import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Component } from "./frontend/routes/excel-master";
import { Component as DocsComponent } from "./frontend/routes/excel-docs";
import "./styles.css";
const Page = window.location.pathname === "/docs" ? DocsComponent : Component;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
