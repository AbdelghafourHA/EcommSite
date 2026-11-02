// src/pages/NotFoundPage.jsx
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { useLang } from "@/hooks/useLang";

export default function NotFoundPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-primary-200 mb-2">404</div>
        <h1 className="font-heading font-bold text-2xl mb-2">
          {lang === "ar"
            ? "الصفحة غير موجودة"
            : lang === "fr"
            ? "Page introuvable"
            : "Page not found"}
        </h1>
        <p className="text-stone-500 mb-8">
          {lang === "ar"
            ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
            : lang === "fr"
            ? "La page que vous recherchez n'existe pas ou a été déplacée."
            : "The page you're looking for doesn't exist or has been moved."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to={`/${lang}`}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 py-2.5 rounded-lg transition"
          >
            <Home className="w-4 h-4" />
            {lang === "ar" ? "الرئيسية" : lang === "fr" ? "Accueil" : "Home"}
          </Link>
          <Link
            to={`/${lang}/products`}
            className="inline-flex items-center gap-2 border border-stone-200 hover:bg-stone-50 font-medium px-5 py-2.5 rounded-lg transition"
          >
            <Search className="w-4 h-4" />
            {lang === "ar"
              ? "المنتجات"
              : lang === "fr"
              ? "Produits"
              : "Products"}
          </Link>
        </div>
      </div>
    </div>
  );
}
