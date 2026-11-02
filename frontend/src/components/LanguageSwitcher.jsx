// src/components/LanguageSwitcher.jsx
import { useState } from "react";
import { Globe } from "lucide-react";
import { useLang } from "@/hooks/useLang";

const LANG_LABELS = {
  ar: "العربية",
  fr: "Français",
  en: "English",
};

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-stone-100 transition"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{LANG_LABELS[lang]}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul className="absolute end-0 mt-1 bg-white shadow-lg rounded-md border border-stone-200 py-1 min-w-[140px] z-50">
            {Object.keys(LANG_LABELS).map((l) => (
              <li key={l}>
                <button
                  onClick={() => {
                    setLang(l);
                    setOpen(false);
                  }}
                  className={`w-full text-start px-4 py-2 text-sm hover:bg-stone-100 transition ${
                    l === lang ? "font-bold text-primary-600" : ""
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
  );
}
