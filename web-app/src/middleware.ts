/**
 * SEO Middleware
 * Eski İngilizce URL'lerden yeni Türkçe URL'lere otomatik yönlendirme
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Middleware matcher - hangi path'lerde çalışacağını belirler
 */
export const config = {
  matcher: [
    /*
     * Tüm path'leri eşleştir, şunlar hariç:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes (API route'ları yönlendirme yok)
     * - admin panel (admin route'larını yönlendirme yok)
     * - auth pages (auth sayfalarını yönlendirme yok)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin|auth|.*\\..*|_next).*)',
  ],
};

/**
 * Statik redirect map - Eski URL'den yeni URL'ye eşleme
 * İngilizce -> Türkçe yönlendirmeler
 */
const URL_REDIRECT_MAP: Record<string, string> = {
  // Ana sayfalar
  '/hotels': '/oteller',
  '/tours': '/turlar',
  '/transfers': '/transferler',
  '/guides': '/rehberler',
  '/places': '/gezilecek-yerler',
  '/campaigns': '/kampanyalar',
  '/visa': '/vize',
  '/cars': '/arac-kiralama',
  '/planner': '/seyahat-planlayici',
  
  // Bilgi sayfaları
  '/about': '/hakkimizda',
  '/contact': '/iletisim',
  '/faq': '/sikca-sorulan-sorular',
  '/privacy': '/gizlilik-politikasi',
  '/terms': '/kullanim-kosullari',
  '/kvkk': '/kvkk-aydinlatma-metni',
  '/cancellation': '/iptal-iade-politikasi',
  '/cookies': '/cerez-politikasi',
  
  // Kullanıcı sayfaları
  '/profile': '/profil',
  '/reservations': '/rezervasyonlar',
  '/favorites': '/favoriler',
};

/**
 * Dinamik sayfa redirect eşlemeleri
 * Türkçe slug URL'leri eski ID route'larına yönlendirir
 * (Veri çekme için mevcut route'ları kullanır)
 */
const DYNAMIC_REDIRECT_PATTERNS: Record<string, (matches: RegExpMatchArray) => string> = {
  // Oteller: /oteller/[slug] -> /hotels/[id]
  '^/oteller/([^/]+)$': (matches) => {
    const slug = matches[1];
    // Slug'dan ID'yi çıkar
    const id = slug.split('-').pop() || slug;
    return `/hotels/${id}`;
  },

  // Rehberler: /rehberler/[slug] -> /guides/[id]
  '^/rehberler/([^/]+)$': (matches) => {
    const slug = matches[1];
    const id = slug.split('-').pop() || slug;
    return `/guides/${id}`;
  },

  // Gezilecek Yerler: /gezilecek-yerler/[slug] -> /places/[id]
  '^/gezilecek-yerler/([^/]+)$': (matches) => {
    const slug = matches[1];
    const id = slug.split('-').pop() || slug;
    return `/places/${id}`;
  },

  // Turlar: /turlar/[slug] -> /tours/[id]
  '^/turlar/([^/]+)$': (matches) => {
    const slug = matches[1];
    const id = slug.split('-').pop() || slug;
    return `/tours/${id}`;
  },

  // Transferler: /transferler/[slug] -> /transfers/[id]
  '^/transferler/([^/]+)$': (matches) => {
    const slug = matches[1];
    const id = slug.split('-').pop() || slug;
    return `/transfers/${id}`;
  },

  // Blog: /blog/[slug] -> /blog/[id]
  '^/blog/([^/]+)$': (matches) => {
    const slug = matches[1];
    const id = slug.split('-').pop() || slug;
    return `/blog/${id}`;
  },
};

/**
 * Ana middleware fonksiyonu
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Trailing slash ekle (next.config.ts trailingSlash: true ile uyumlu)
  const normalizedPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const pathWithSlash = normalizedPath + '/';

  // 1. Statik redirect map kontrolü
  if (URL_REDIRECT_MAP[normalizedPath]) {
    const redirectUrl = new URL(URL_REDIRECT_MAP[normalizedPath] + '/', request.url);
    return NextResponse.redirect(redirectUrl, {
      status: 301, // Permanent redirect
      headers: {
        'X-Redirected-By': 'SEO-Middleware-Static',
      },
    });
  }

  // 2. Dinamik redirect pattern kontrolü
  for (const [pattern, redirectFn] of Object.entries(DYNAMIC_REDIRECT_PATTERNS)) {
    const regex = new RegExp(pattern);
    const matches = normalizedPath.match(regex);
    
    if (matches) {
      const newPath = redirectFn(matches) + '/';
      const redirectUrl = new URL(newPath, request.url);
      
      return NextResponse.redirect(redirectUrl, {
        status: 301, // Permanent redirect
        headers: {
          'X-Redirected-By': 'SEO-Middleware-Dynamic',
          'X-Original-Path': normalizedPath,
        },
      });
    }
  }

  // 3. Trailing slash kontrolü ve yönlendirme
  if (pathname !== pathWithSlash && !pathname.match(/\.[a-z]+$/i)) {
    // Dosya uzantısı yoksa trailing slash ekle
    const redirectUrl = new URL(pathWithSlash, request.url);
    return NextResponse.redirect(redirectUrl, {
      status: 308, // Permanent redirect (method preserving)
      headers: {
        'X-Redirected-By': 'SEO-Middleware-TrailingSlash',
      },
    });
  }

  // Redirect gerekmiyor, devam et
  return NextResponse.next();
}
