import React, { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/UseAuth';
import { FaBars } from 'react-icons/fa';
import { usePlaylists } from '@/hooks/UsePlaylists';

interface NavBarProps {
  children: ReactNode;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ children, onLoginClick, onRegisterClick }) => {
  const { user, logout, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { clearPlaylists } = usePlaylists();

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  // Define handleLogout function
  const handleLogout = () => {
    clearPlaylists();
    logout();
    setShowDropdown(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // This useEffect is for debugging purposes to see when the user state updates
  useEffect(() => {
    console.log("Current User in NavBar:", user);
  }, [user]);

  if (loading) {
    return <div className="p-4 bg-gray-100 text-center">Logging in...</div>;
  }

  return (
    <div className="flex justify-between items-center p-4 bg-gray-100">
      {children}

      {user ? (
        <div className="flex items-center">
          <FaBars className="text-xl cursor-pointer" onClick={toggleDropdown} />
          <div className={`dropdown-menu ${showDropdown ? 'block' : 'hidden'}`} ref={dropdownRef}>
            <Link href="/settings">
              <span className="dropdown-item cursor-pointer" onClick={() => setShowDropdown(false)}>Settings</span>
            </Link>
            <button onClick={handleLogout} className="dropdown-item">Logout</button>
          </div>
        </div>
      ) : (
        <div>
          <button onClick={onLoginClick} className="text-blue-500 hover:text-blue-600">
            Log in
          </button>
          <span className="mx-2">/</span>
          <button onClick={onRegisterClick} className="text-blue-500 hover:text-blue-600">
            Register
          </button>
        </div>
      )}
    </div>
  );
};

export default NavBar;
