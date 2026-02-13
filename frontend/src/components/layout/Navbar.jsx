import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? 'text-dm-accent border-b-2 border-dm-accent'
      : 'text-dm-muted hover:text-dm-text';

  return (
    <nav className="bg-dm-dark border-b border-dm-mid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-dm-light tracking-tight">
              DebateMuscle
            </Link>
            {user && (
              <div className="flex items-center gap-6">
                <Link
                  to="/"
                  className={`text-sm font-medium pb-0.5 transition-colors ${isActive('/')}`}
                >
                  My Videos
                </Link>
                <Link
                  to="/reviews"
                  className={`text-sm font-medium pb-0.5 transition-colors ${isActive('/reviews')}`}
                >
                  Reviews
                </Link>
              </div>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-dm-muted">{user.display_name}</span>
              <button
                onClick={logoutUser}
                className="text-sm text-dm-muted hover:text-dm-text transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
