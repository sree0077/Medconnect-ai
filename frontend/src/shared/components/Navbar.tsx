import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              MedConnect AI
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <span className="text-gray-700">
                  Welcome, {user.role === "doctor" ? "Dr. " : ""}{user.name}
                </span>
                <Link
                  to={`/${user.role === 'patient' ? 'dashboard' : user.role + '/dashboard'}`}
                  className="text-gray-600 hover:text-primary-600"
                >
                  Dashboard
                </Link>
                {role === "admin" && (
                  <Link
                    to="/admin/users"
                    className="text-gray-600 hover:text-primary-600"
                  >
                    Manage Users
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-gray-600 hover:text-primary-600"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}