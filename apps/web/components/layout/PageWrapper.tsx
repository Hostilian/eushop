import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard page wrapper layout.
 * Ensures consistent margins, layouts, responsive grids, and dark/light color schemes.
 * Applies a smooth fade-in animation on mounting to prevent visual layout snap.
 */
export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />
      
      {/* Main content container */}
      <main className={`flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in ${className}`}>
        {children}
      </main>

      <Footer />
    </div>
  );
}

