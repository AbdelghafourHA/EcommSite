// src/components/CategoryStrip.jsx
import { Link } from "react-router-dom";
import { useLang } from "@/hooks/useLang";
import { useCategories } from "@/hooks/useCategories";

export default function CategoryStrip({ activeSlug }) {
  const { lang } = useLang();
  const { data, isLoading } = useCategories({ activeOnly: true });

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto py-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-16 h-16 rounded-full bg-stone-200 animate-pulse" />
            <div className="w-12 h-3 bg-stone-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const categories = data?.categories || [];
  if (categories.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* "All" chip */}
      <Link
        to={`/${lang}/products`}
        className="shrink-0 flex flex-col items-center gap-1.5 group"
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition ${
            !activeSlug
              ? "border-primary-500 bg-primary-50"
              : "border-stone-200 bg-white group-hover:border-primary-300"
          }`}
        >
          <span className="text-2xl">🛍️</span>
        </div>
        <span
          className={`text-xs font-medium max-w-[72px] truncate ${
            !activeSlug ? "text-primary-600" : "text-stone-600"
          }`}
        >
          {lang === "ar" ? "الكل" : lang === "fr" ? "Tout" : "All"}
        </span>
      </Link>

      {categories.map((cat) => {
        const name = cat.name?.[lang] || cat.name?.en || "—";
        const isActive = cat.slug === activeSlug;

        return (
          <Link
            key={cat._id}
            to={`/${lang}/categories/${cat.slug}`}
            className="shrink-0 flex flex-col items-center gap-1.5 group"
          >
            <div
              className={`w-16 h-16 rounded-full overflow-hidden border-2 transition ${
                isActive
                  ? "border-primary-500"
                  : "border-stone-200 group-hover:border-primary-300"
              }`}
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center text-2xl">
                  {cat.emoji || "🍽️"}
                </div>
              )}
            </div>
            <span
              className={`text-xs font-medium max-w-[72px] truncate ${
                isActive ? "text-primary-600 font-bold" : "text-stone-600"
              }`}
            >
              {name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
