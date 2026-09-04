import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-5xl sm:text-6xl font-bold text-neutral-200 mb-3">404</h1>
      <p className="text-lg font-semibold text-neutral-900 mb-2">Page not found</p>
      <p className="text-sm text-neutral-500 max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 bg-primary-600 text-white font-semibold text-sm rounded-lg hover:bg-primary-700 transition-colors"
        >
          Home
        </Link>
        <Link
          to="/jobs"
          className="px-5 py-2.5 border border-neutral-300 text-neutral-700 font-semibold text-sm rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Browse Jobs
        </Link>
      </div>
    </div>
  );
}
