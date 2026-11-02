// src/layouts/RootLayout.jsx
import { Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/Toast";
import ScrollToTop from "@/components/ScrollToTop";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ScrollToTop />
          <Outlet />
          <ToastContainer />
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
