// src/components/CategoryStrip.jsx
import { Link } from "react-router-dom";
import { useLang } from "@/hooks/useLang";
import { useCategories } from "@/hooks/useCategories";

export default function CategoryStrip({ activeSlug }) {
  const { lang } = useLang();
  const { data, isLoading } = useCategories({ activeOnly: true });

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-28 bg-stone-200 rounded-full animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  const categories = data?.categories || [];

  if (categories.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin">
      <Link
        to={`/${lang}/products`}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${
          !activeSlug
            ? "bg-primary-500 text-white border-primary-500"
            : "bg-white text-stone-700 border-stone-200 hover:border-primary-300"
        }`}
      >
        {lang === "ar" ? "الكل" : lang === "fr" ? "Tout" : "All"}
      </Link>

      {categories.map((cat) => {
        const name = cat.name?.[lang] || cat.name?.en || "—";
        const isActive = cat.slug === activeSlug;

        return (
          <Link
            key={cat._id}
            to={`/${lang}/categories/${cat.slug}`}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
              isActive
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-white text-stone-700 border-stone-200 hover:border-primary-300"
            }`}
          >
            <span>{cat.emoji || "🍽️"}</span>
            <span>{name}</span>
          </Link>
        );
      })}
    </div>
  );
}
