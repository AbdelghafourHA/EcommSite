// src/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import StoreLayout from "@/layouts/StoreLayout";
import AdminLayout from "@/layouts/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import CategoryPage from "@/pages/CategoryPage";
import ProductPage from "@/pages/ProductPage";
import SearchPage from "@/pages/SearchPage";
import CartPage from "@/pages/CartPage";
import NotFoundPage from "@/pages/NotFoundPage";
import LoginPage from "@/pages/admin/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import AdminProductsPage from "@/pages/admin/ProductsPage";

function RootRedirect() {
  return <Navigate to="/ar" replace />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <RootRedirect /> },

      {
        path: "/:lang",
        element: <StoreLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "products", element: <ProductsPage /> },
          { path: "products/:slug", element: <ProductPage /> },
          { path: "categories/:slug", element: <CategoryPage /> },
          { path: "search", element: <SearchPage /> },
          { path: "cart", element: <CartPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },

      { path: "/:lang/admin/login", element: <LoginPage /> },

      {
        path: "/:lang/admin",
        element: <ProtectedRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: "categories", element: <CategoriesPage /> },
              { path: "products", element: <AdminProductsPage /> },
              { path: "*", element: <NotFoundPage /> },
            ],
          },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
