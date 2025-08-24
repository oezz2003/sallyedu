import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Text */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">
              Smart Learning Academy
            </h1>
          </div>

          {/* Right: Logo */}
          <div className="flex-shrink-0">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F38ef883953564d1a82331b4c525de032%2Fe861ade0635241c398abb23cc1b3fee3?format=webp&width=800"
              alt="Smart Learning Academy Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
