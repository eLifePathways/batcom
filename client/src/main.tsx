import { createRoot } from "react-dom/client";
import { Router } from 'wouter';
import App from "./App";
import "./index.css";

// Create a base URL for the router
const base = '/';

createRoot(document.getElementById("root")!).render(
  <Router base={base}>
    <App />
  </Router>
);
