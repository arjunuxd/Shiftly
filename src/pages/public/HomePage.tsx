import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4">
        Shiftly
      </h1>
      <p className="text-xl sm:text-2xl text-neutral-500 mb-8">
        Find Your Next Shift.
      </p>
      <p className="text-neutral-600 max-w-md mb-10">
        A trusted flexible-employment platform connecting verified job seekers
        with local part-time, temporary, and shift-based opportunities.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/register"
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
