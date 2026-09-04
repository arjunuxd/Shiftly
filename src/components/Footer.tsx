import { Link } from "react-router-dom";

const currentYear = new Date().getFullYear();

const footerLinks = {
  platform: [
    { to: "/jobs", label: "Find Jobs" },
    { to: "/how-it-works", label: "How It Works" },
    { to: "/register", label: "Get Started" },
  ],
  company: [
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ],
  legal: [
    { to: "/privacy", label: "Privacy" },
    { to: "/terms", label: "Terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-white font-bold text-xs">
                S
              </div>
              <span className="text-base font-bold tracking-tight text-neutral-900">
                Shiftly
              </span>
            </Link>
            <p className="mt-3 text-sm text-neutral-500 leading-relaxed max-w-xs">
              A trusted platform for flexible employment.
            </p>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3">
                {heading.charAt(0).toUpperCase() + heading.slice(1)}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-400">
            &copy; {currentYear} Shiftly. All rights reserved.
          </p>
          <p className="text-xs text-neutral-400">
            Built for better flexible employment.
          </p>
        </div>
      </div>
    </footer>
  );
}
