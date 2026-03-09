import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImage from 'figma:asset/5102d054643eab1a184a7c4a067a254790238208.png';

export function Footer() {
  return (
    <footer id="iletisim" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 inline-flex">
              <img 
                src={logoImage} 
                alt="Sefernur Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-white">Sefernur</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Hac ve Umre seyahatleriniz için güvenilir dijital platformunuz.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Hakkımızda</a></li>
              <li><a href="#ozellikler" className="hover:text-emerald-400 transition-colors">Özellikler</a></li>
              <li><a href="#hizmetler" className="hover:text-emerald-400 transition-colors">Hizmetler</a></li>
              <li><Link to="/blog" className="hover:text-emerald-400 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white mb-4">Hizmetler</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Otel Rezervasyonu</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Vize İşlemleri</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Transfer Hizmetleri</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Tur Paketleri</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4">İletişim</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>+90 (212) 555 0000</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>info@sefernur.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>İstanbul, Türkiye</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">
              © 2025 Sefernur. Tüm hakları saklıdır.
            </p>
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-end">
              <Link to="/gizlilik-politikasi" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Gizlilik Politikası
              </Link>
              <Link to="/kullanim-kosullari" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Kullanım Koşulları
              </Link>
              <Link to="/kvkk" className="text-gray-400 hover:text-emerald-400 transition-colors">
                KVKK
              </Link>
              <Link to="/hesap-silme" className="text-gray-400 hover:text-emerald-400 transition-colors">
                Hesap Silme
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
