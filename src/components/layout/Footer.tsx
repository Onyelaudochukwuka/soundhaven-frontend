// components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-200 text-gray-600 body-font">
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <p className="text-sm text-gray-500 sm:ml-6 sm:mt-0 mt-4">
          © {new Date().getFullYear()} SoundHaven —
          <a href="https://github.com/alexdwagner" className="text-gray-600 ml-1" rel="noopener noreferrer" target="_blank">@alexdwagner</a>
        </p>
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
          <a href="#" className="text-gray-500">
            {/* Social icons can be added here */}
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
