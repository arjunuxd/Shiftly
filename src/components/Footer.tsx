import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h2 className="text-white font-semibold text-lg mb-3">Shiftly</h2>
            <p className="text-sm leading-relaxed">
              Find Your Next Shift. A trusted platform for flexible
              employment opportunities.
            </p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-medium mb-3">Roles</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/job-seeker" className="hover:text-white transition-colors">
                  Job Seekers
                </Link>
              </li>
              <li>
                <Link to="/vendor" className="hover:text-white transition-colors">
                  Vendors
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-neutral-800 text-center text-sm">
          <p>&copy; {currentYear} Shiftly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
