import React from "react";
import { Clock, Globe } from "lucide-react";

const Navbar: React.FC = () => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Enhanced Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F38ef883953564d1a82331b4c525de032%2Fe861ade0635241c398abb23cc1b3fee3?format=webp&width=800"
                  alt="Smart Learning Academy Logo"
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Smart Learning Academy
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Educational Excellence Platform</p>
              </div>
            </div>
          </div>

          {/* Right: Status Information */}
          <div className="flex items-center gap-6">
            {/* Date and Time */}
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{currentDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{currentTime}</span>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 hidden sm:inline">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
