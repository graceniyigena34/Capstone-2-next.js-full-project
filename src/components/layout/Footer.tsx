import Link from 'next/link';
import { Container } from './container';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Help', href: '/help' },
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <Container>
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-green-600 rounded-full" />
              <span className="text-lg font-bold text-gray-900">Storypress</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center space-x-6">
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors mb-2"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Copyright Text */}
            <p className="text-sm text-gray-600 mt-4 md:mt-0">
              © {currentYear} Storypress. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}