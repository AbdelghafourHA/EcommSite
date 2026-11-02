// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import phoenixLogoWithText from "@/assets/phoenix_logo_with_text.png";

/* ── Brand SVG icons ── */
const InstagramIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function Footer() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const year = new Date().getFullYear();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : undefined;

  return (
    <footer className="bg-stone-900 text-stone-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to={`/${lang}`}
              className="inline-flex items-center mb-4"
              aria-label="PHOENIX — Home"
            >
              <img
                src={phoenixLogoWithText}
                alt="PHOENIX"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed mb-5 text-stone-400">
              {lang === "ar"
                ? "متجرك الأول للمنتجات ذات الجودة العالية. تصفح، اختر، واطلب مباشرة عبر واتساب."
                : lang === "fr"
                ? "Votre première boutique pour des produits de qualité. Parcourez, choisissez, et commandez via WhatsApp."
                : "Your first store for quality products. Browse, choose, and order via WhatsApp."}
            </p>

            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-stone-800 hover:bg-primary-500 flex items-center justify-center transition"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-stone-800 hover:bg-primary-500 flex items-center justify-center transition"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md bg-stone-800 hover:bg-green-500 flex items-center justify-center transition"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">
              {lang === "ar"
                ? "روابط سريعة"
                : lang === "fr"
                ? "Liens rapides"
                : "Quick links"}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to={`/${lang}`}
                  className="text-sm text-stone-400 hover:text-primary-400 transition"
                >
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${lang}/products`}
                  className="text-sm text-stone-400 hover:text-primary-400 transition"
                >
                  {t("nav.products")}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${lang}/cart`}
                  className="text-sm text-stone-400 hover:text-primary-400 transition"
                >
                  {t("nav.cart")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                <span className="text-sm text-stone-400" dir="ltr">
                  +213 555 123 456
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                <span className="text-sm text-stone-400" dir="ltr">
                  contact@phoenix.dz
                </span>
              </li>
            </ul>
          </div>

          {/* WhatsApp CTA */}
          <div>
            <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4">
              {lang === "ar"
                ? "اطلب عبر واتساب"
                : lang === "fr"
                ? "Commandez sur WhatsApp"
                : "Order on WhatsApp"}
            </h3>
            <p className="text-sm text-stone-400 mb-4 leading-relaxed">
              {lang === "ar"
                ? "أضف المنتجات للسلة وأتمم طلبك مباشرة عبر واتساب."
                : lang === "fr"
                ? "Ajoutez au panier et finalisez via WhatsApp."
                : "Add to cart and check out directly on WhatsApp."}
            </p>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            © {year} PHOENIX · {t("footer.rights")}
          </p>
          <Link
            to={`/${lang}/admin/login`}
            className="text-xs text-stone-600 hover:text-stone-400 transition"
          >
            {t("admin.login")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
