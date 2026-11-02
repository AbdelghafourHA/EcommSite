// src/hooks/useLang.js
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { RTL_LANGS, SUPPORTED_LANGS } from "@/lib/i18n";

export const useLang = () => {
  const { i18n } = useTranslation();
  const { lang: urlLang } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const currentLang = SUPPORTED_LANGS.includes(urlLang)
    ? urlLang
    : i18n.language || "ar";

  useEffect(() => {
    if (!currentLang) return;
    const isRtl = RTL_LANGS.includes(currentLang);
    document.documentElement.setAttribute("lang", currentLang);
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [currentLang, i18n]);

  const setLang = (next) => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length > 0 && SUPPORTED_LANGS.includes(segments[0])) {
      segments[0] = next;
    } else {
      segments.unshift(next);
    }
    navigate("/" + segments.join("/") + location.search, { replace: true });
  };

  return { lang: currentLang, setLang };
};
