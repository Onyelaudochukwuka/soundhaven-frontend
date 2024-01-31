import React, { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/UseAuth';
import { FaBars } from 'react-icons/fa';

interface NavBarProps {
  children: ReactNode;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ children, onLoginClick, onRegisterClick }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // This useEffect is for debugging purposes to see when the user state updates
  useEffect(() => {
    console.log("Current User in NavBar:", user);
  }, [user]);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false); // Close dropdown on logout
  };

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
