import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { Services } from './components/Services';
import { Stats } from './components/Stats';
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AccountDeletion } from './components/AccountDeletion';
import { TermsOfService } from './components/TermsOfService';
import { KVKK } from './components/KVKK';
import { Contact } from './components/Contact';
import { UmrahPackages } from './components/UmrahPackages';
import { UmrahPackageDetail } from './components/UmrahPackageDetail';
import { HajjDetail } from './components/HajjDetail';
import { UmrahDetail } from './components/UmrahDetail';
import { Blog } from './components/Blog';
import { BlogDetail } from './components/BlogDetail';
import logoImage from 'figma:asset/5102d054643eab1a184a7c4a067a254790238208.png';

function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Services />
      <Stats />
      <Testimonials />
      <CTA />
    </>
  );
}

export default function App() {
  useEffect(() => {
    // Set favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = logoImage;
    document.getElementsByTagName('head')[0].appendChild(link);
    
    // Set page title
    document.title = 'Sefernur - Hac ve Umre Seyahat Uygulaması';
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gizlilik-politikasi" element={<PrivacyPolicy />} />
            <Route path="/hesap-silme" element={<AccountDeletion />} />
            <Route path="/kullanim-kosullari" element={<TermsOfService />} />
            <Route path="/kvkk" element={<KVKK />} />
            <Route path="/iletisim" element={<Contact />} />
            <Route path="/umre-paketleri" element={<UmrahPackages />} />
            <Route path="/umre-paketleri/:id" element={<UmrahPackageDetail />} />
            <Route path="/hac-organizasyonu" element={<HajjDetail />} />
            <Route path="/umre-seyahatleri" element={<UmrahDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
