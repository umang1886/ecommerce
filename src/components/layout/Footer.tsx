import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const FOOTER_LINKS = {
  Shop: [
    { label: "Disposable Products", href: "/category/disposable-products" },
    { label: "Cleaning Products", href: "/category/cleaning-products" },
    { label: "Cleaning Chemicals", href: "/category/cleaning-chemicals" },
    { label: "Paper Products", href: "/category/paper-products" },
    { label: "Plastic & Others", href: "/category/plastic-products" },
  ],
  Account: [
    { label: "My Orders", href: "/orders" },
    { label: "Account Settings", href: "/account" },
    { label: "Sign In", href: "/login" },
  ],
  Support: [
    { label: "WhatsApp Us", href: "https://wa.me/919737777184" },
    { label: "Call Us", href: "tel:+919737777184" },
    { label: "Email Us", href: "mailto:orders@jaygeliambemaa.in" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="text-xl sm:text-2xl font-black mb-3 tracking-tight flex flex-col sm:flex-row sm:items-center leading-none sm:leading-tight">
              <span className="text-white">Jay Geli Ambe Maa</span>
              <span className="text-amber-400 sm:ml-1">Trader</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Your trusted wholesale and retail supplier for disposable products,
              cleaning supplies, paper products, and more. Serving businesses and
              homes across India since 2010.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400 flex-shrink-0" />
                <a href="tel:+919737777184" className="hover:text-white transition-colors">
                  +91 97377 77184
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400 flex-shrink-0" />
                <a href="mailto:orders@jaygeliambemaa.in" className="hover:text-white transition-colors">
                  orders@jaygeliambemaa.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                <span className="leading-snug max-w-xs">
                  5, Anandnagar Complex, 2, 100 Feet Anand Nagar Rd, opposite Shyam Sunder Bunglows, near Reliance Petrol Pump, Satellite, Ahmedabad, Gujarat 380015
                </span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {section}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Jay Geli Ambe Maa Trader. All rights reserved. GST invoicing available.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>🇮🇳 India</span>
            <span>•</span>
            <span>UPI · COD · Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
