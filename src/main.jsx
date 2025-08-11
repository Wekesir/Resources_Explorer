import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext"; // Import the ThemeProvider
import { BookProvider } from "./context/BookContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <BookProvider>
          <App />
        </BookProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
