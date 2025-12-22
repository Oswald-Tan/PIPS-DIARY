import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const handleGoHome = () => {
    navigate(-1)
  };

  return (
    <div className="min-h-screen text-slate-900 bg-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-md mx-auto text-center">
          {/* Error Number */}
          <div className="text-8xl md:text-9xl font-bold text-slate-200 mb-4">
            404
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-medium text-slate-800 mb-4">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-slate-600 mb-8 font-light">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Back to Home Button */}
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-black text-white rounded-full font-medium text-sm hover:bg-gray-800 transition-colors duration-200 shadow cursor-pointer flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage
          </button>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} Pips Diary. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}