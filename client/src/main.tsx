import { createRoot } from "react-dom/client";
import { Router } from 'wouter';
import App from "./App";
import "./index.css";
import { initErrorTracking } from "./utils/error-tracking";

// Initialize error tracking
initErrorTracking();

// Create a base URL for the router
const base = '/';

createRoot(document.getElementById("root")!).render(
  <Router base={base}>
    <App />
  </Router>
);
