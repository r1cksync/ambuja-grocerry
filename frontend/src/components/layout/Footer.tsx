import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AN</span>
              </div>
              <div>
                <h3 className="font-bold text-white">Ambuja Neotia</h3>
                <p className="text-xs text-gray-400">Grocery</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted grocery partner. Fresh products delivered right to your doorstep.
              Exclusively for Ambuja Neotia employees.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary-400 transition-colors">
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-primary-400 transition-colors">
                  Offers & Deals
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-primary-400 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-primary-400 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-primary-400 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                <span>
                  Ambuja Neotia Group<br />
                  Kolkata, West Bengal<br />
                  India - 700091
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} />
                <span>+91 33 4040 6060</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} />
                <span>grocery@ambujaneotia.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2025 Ambuja Neotia Grocery. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>We Accept:</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">UPI</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">Cards</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
