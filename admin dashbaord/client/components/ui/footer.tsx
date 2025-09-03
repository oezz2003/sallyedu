import React from 'react';
import { Heart, Shield, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Smart Learning Academy</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Empowering education through innovative technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Admin Panel</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-gray-600 hover:text-blue-600">Dashboard</a></li>
              <li><a href="/students" className="text-gray-600 hover:text-blue-600">Students</a></li>
              <li><a href="/payments" className="text-gray-600 hover:text-blue-600">Payments</a></li>
              <li><a href="/settings" className="text-gray-600 hover:text-blue-600">Settings</a></li>
            </ul>
          </div>

          {/* System Status */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600">All Systems Operational</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Secure Connection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © {currentYear} Smart Learning Academy. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-600 mt-2 sm:mt-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for education</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;