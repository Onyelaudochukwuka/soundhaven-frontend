// components/layout/NavBar.jsx
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { FaBars } from 'react-icons/fa';

interface NavBarProps {
  children: ReactNode;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ children, onLoginClick, onRegisterClick }) => {
  const { user, logout } = useUser();

  return (
    <div className="flex justify-between items-center p-4 bg-gray-100">
      {children}

      {user ? (
        // Show hamburger menu for logged-in users
        <div className="flex items-center">
          <FaBars className="text-xl cursor-pointer" />
          {/* Dropdown menu */}
          <div className="dropdown-menu hidden">
            <Link href="/settings">
              <a className="dropdown-item">Settings</a>
            </Link>
            <button onClick={logout} className="dropdown-item">Logout</button>
          </div>
        </div>
      ) : (
        <div>
          <button onClick={onLoginClick} className="text-blue-500 hover:text-blue-600">
            log in
          </button>
          <span className="mx-2">/</span>
          <button onClick={onRegisterClick} className="text-blue-500 hover:text-blue-600">
            register
          </button>
        </div>
      )}
    </div>
  );
};

export default NavBar;
