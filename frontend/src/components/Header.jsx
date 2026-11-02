// src/components/Header.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ShoppingCart, Menu, X, Globe } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { useCategories } from "@/hooks/useCategories";
import { SUPPORTED_LANGS } from "@/lib/i18n";
import phoenixLogo from "../assets/phoenix_logo_no_text.png";

const LANG_LABELS = {
  ar: "العربية",
  fr: "Français",
  en: "English",
};

export default function Header() {
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const navigate = useNavigate();
  const { data: catsData } = useCategories({ activeOnly: true });
  const categories = catsData?.categories || [];

  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const openCart = useUIStore((s) => s.openCart);

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${lang}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const goTo = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200">
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden -ms-2 p-2 rounded-md hover:bg-stone-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link
            to={`/${lang}`}
            className="flex items-center shrink-0"
            onClick={() => setMobileOpen(false)}
            aria-label="PHOENIX — Home"
          >
            <img
              src={phoenixLogo}
              alt="PHOENIX"
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* Search — desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:block flex-1 max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("common.search")}
                className="w-full ps-10 pe-4 py-2 bg-stone-100 border border-transparent rounded-lg focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 text-sm transition"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ms-auto md:ms-0">
            {/* Language */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen((s) => !s)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-stone-100 transition text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                <span>{LANG_LABELS[lang]}</span>
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <ul className="absolute end-0 top-full mt-1 bg-white shadow-lg border border-stone-200 rounded-lg py-1 min-w-[140px] z-50">
                    {SUPPORTED_LANGS.map((l) => (
                      <li key={l}>
                        <button
                          onClick={() => {
                            setLang(l);
                            setLangMenuOpen(false);
                          }}
                          className={`w-full text-start px-4 py-2 text-sm hover:bg-stone-50 transition ${
                            l === lang
                              ? "font-bold text-primary-600"
                              : "text-stone-700"
                          }`}
                        >
                          {LANG_LABELS[l]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-md hover:bg-stone-100 transition"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -end-0.5 min-w-[1.25rem] h-5 px-1 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category strip — desktop only */}
        {categories.length > 0 && (
          <div className="hidden lg:block border-t border-stone-100">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex gap-1 overflow-x-auto py-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <Link
                  to={`/${lang}/products`}
                  className="shrink-0 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition"
                >
                  {t("common.all")}
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/${lang}/categories/${cat.slug}`}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition"
                  >
                    <span>{cat.emoji || "🍽️"}</span>
                    <span>{cat.name?.[lang] || cat.name?.en || "—"}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed top-0 start-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 flex flex-col lg:hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <Link
                to={`/${lang}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center"
              >
                <img
                  src={phoenixLogo}
                  alt="PHOENIX"
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md hover:bg-stone-100"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("common.search")}
                    className="w-full ps-10 pe-4 py-2.5 bg-stone-100 border border-transparent rounded-lg focus:bg-white focus:border-primary-500 focus:outline-none text-sm"
                  />
                </div>
              </form>
            </div>

            <nav className="flex-1 overflow-y-auto px-2">
              <div className="px-3 py-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                {t("nav.categories")}
              </div>
              <button
                onClick={() => goTo(`/${lang}/products`)}
                className="w-full text-start px-3 py-2.5 rounded-md hover:bg-stone-100 text-sm font-medium"
              >
                {t("common.all")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => goTo(`/${lang}/categories/${cat.slug}`)}
                  className="w-full flex items-center gap-2 text-start px-3 py-2.5 rounded-md hover:bg-stone-100 text-sm font-medium"
                >
                  <span>{cat.emoji || "🍽️"}</span>
                  <span>{cat.name?.[lang] || cat.name?.en || "—"}</span>
                </button>
              ))}
            </nav>

            <div className="border-t border-stone-200 p-3">
              <div className="px-3 py-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                {t("nav.home")}
              </div>
              <div className="flex gap-1 flex-wrap px-1">
                {SUPPORTED_LANGS.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setMobileOpen(false);
                    }}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition ${
                      l === lang
                        ? "bg-primary-500 text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    {LANG_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
