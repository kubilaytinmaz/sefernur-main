import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImage from 'figma:asset/5102d054643eab1a184a7c4a067a254790238208.png';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logoImage} 
              alt="Sefernur Logo" 
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-emerald-800">Sefernur</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#ozellikler" className="text-gray-700 hover:text-emerald-700 transition-colors">
              Özellikler
            </a>
            <a href="#nasil-calisir" className="text-gray-700 hover:text-emerald-700 transition-colors">
              Nasıl Çalışır
            </a>
            <a href="#hizmetler" className="text-gray-700 hover:text-emerald-700 transition-colors">
              Hizmetler
            </a>
            <Link to="/blog" className="text-gray-700 hover:text-emerald-700 transition-colors">
              Blog
            </Link>
            <Link to="/iletisim" className="text-gray-700 hover:text-emerald-700 transition-colors">
              İletişim
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
              Giriş Yap
            </Button>
            <Button className="bg-emerald-700 hover:bg-emerald-800">
              Uygulamayı İndir
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <a
                href="#ozellikler"
                className="text-gray-700 hover:text-emerald-700 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Özellikler
              </a>
              <a
                href="#nasil-calisir"
                className="text-gray-700 hover:text-emerald-700 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nasıl Çalışır
              </a>
              <a
                href="#hizmetler"
                className="text-gray-700 hover:text-emerald-700 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Hizmetler
              </a>
              <Link
                to="/blog"
                className="text-gray-700 hover:text-emerald-700 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/iletisim"
                className="text-gray-700 hover:text-emerald-700 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                İletişim
              </Link>
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="outline" className="border-emerald-600 text-emerald-700 w-full">
                  Giriş Yap
                </Button>
                <Button className="bg-emerald-700 hover:bg-emerald-800 w-full">
                  Uygulamayı İndir
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
