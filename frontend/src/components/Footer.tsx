import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">About</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-white">About Us</a></li>
              <li><a href="/" className="hover:text-white">Mission</a></li>
              <li><a href="/" className="hover:text-white">Vision</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Academics</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-white">Courses</a></li>
              <li><a href="/" className="hover:text-white">Faculty</a></li>
              <li><a href="/" className="hover:text-white">Departments</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Admissions</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-white">Apply Now</a></li>
              <li><a href="/" className="hover:text-white">Eligibility</a></li>
              <li><a href="/" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@college.edu</li>
              <li>Phone: +91 XXX XXX XXXX</li>
              <li>Address: College St, City</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">&copy; 2024 College ERP Management System. Empowering Educational Excellence.</p>
            <div className="space-x-4">
              <a href="/privacy" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="/terms" className="text-gray-400 hover:text-white">Terms</a>
              <a href="/contact" className="text-gray-400 hover:text-white">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
