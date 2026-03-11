// Styles
import "./styles/index.css";

// Toaster
import { Toaster } from "sonner";

// Routes
import Routes from "@/app/routes.jsx";

// Store (Redux)
import store from "@/app/store";
import { Provider } from "react-redux";

// TanStack Query
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/app/query-client";

// React
import { createRoot } from "react-dom/client";

// Router
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Routes />

        <Toaster
          richColors
          position="top-right"
          offset={{ top: 24 }}
          mobileOffset={{ top: 24 }}
        />
      </Provider>
    </QueryClientProvider>
  </BrowserRouter>,
);
