import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          🛍️ Online Store
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/products" className="hover:text-blue-200">Products</Link>
          <Link to="/cart" className="hover:text-blue-200 relative">
            Cart ({items.length})
          </Link>
          
          {token ? (
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && (
                <Link to="/admin" className="hover:text-blue-200">Admin</Link>
              )}
              <Link to="/orders" className="hover:text-blue-200">Orders</Link>
              <Link to="/profile" className="hover:text-blue-200">{user?.name}</Link>
              <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-700">Login</Link>
              <Link to="/register" className="bg-green-500 px-4 py-2 rounded hover:bg-green-700">Register</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
