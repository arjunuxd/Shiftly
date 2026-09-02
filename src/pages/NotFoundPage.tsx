import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-neutral-300 mb-4">404</h1>
      <p className="text-xl text-neutral-600 mb-2">Page Not Found</p>
      <p className="text-neutral-500 mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Back to Home
      </Link>
    </div>
  );
}
