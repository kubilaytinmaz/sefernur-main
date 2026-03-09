import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { blogPosts } from './Blog';
import { 
  ArrowLeft, Calendar, User, Clock, Share2, 
  Facebook, Twitter, Mail, Tag, ArrowRight
} from 'lucide-react';

export function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-4">Yazı bulunamadı</h2>
          <Button onClick={() => navigate('/blog')}>
            Blog Sayfasına Dön
          </Button>
        </div>
      </div>
    );
  }

  // Get related posts (same category, exclude current)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <ImageWithFallback
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <Button
              onClick={() => navigate('/blog')}
              variant="outline"
              className="mb-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Blog'a Dön
            </Button>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-sm">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-white mb-6 text-3xl md:text-4xl lg:text-5xl max-w-3xl">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{post.readTime} okuma</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Main Column */}
            <div className="lg:col-span-8">
              {/* Excerpt */}
              <div className="bg-emerald-50 border-l-4 border-emerald-600 p-6 rounded-r-xl mb-8">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              {/* Content */}
              <article 
                className="prose prose-lg max-w-none
                  prose-headings:text-gray-900 
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-ul:text-gray-700 prose-ul:mb-6
                  prose-li:mb-2
                  prose-strong:text-gray-900 prose-strong:font-semibold"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Share2 className="w-5 h-5" />
                    <span>Bu yazıyı paylaşın:</span>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${post.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white hover:bg-sky-600 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={`mailto:?subject=${post.title}&body=${shareUrl}`}
                      className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Author Section */}
              <div className="mt-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 mb-2">Yazar: {post.author}</h3>
                    <p className="text-gray-600 text-sm">
                      Sefernur ekibinin deneyimli yazarlarından biri. Hac ve Umre konularında 
                      bilgilendirici içerikler hazırlamaktadır.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                
                {/* CTA Card */}
                <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-6 text-white">
                  <h3 className="text-white mb-3">Umre Paketlerimiz</h3>
                  <p className="text-emerald-100 text-sm mb-4">
                    Size özel umre paketlerimizi inceleyin ve manevi yolculuğunuza başlayın.
                  </p>
                  <Button 
                    onClick={() => navigate('/umre-paketleri')}
                    className="w-full bg-white text-emerald-700 hover:bg-emerald-50"
                  >
                    Paketleri İncele
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-gray-900 mb-4">Kategoriler</h3>
                  <div className="space-y-2">
                    {['Rehber', 'Deneyim', 'Eğitim', 'Gezi', 'Planlama', 'Manevi'].map((category) => (
                      <button
                        key={category}
                        onClick={() => navigate('/blog')}
                        className="flex items-center justify-between w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          {category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {blogPosts.filter(p => p.category === category).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Newsletter */}
                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
                  <h3 className="text-gray-900 mb-3">E-Bülten</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Yeni yazılarımızdan haberdar olun
                  </p>
                  <input
                    type="email"
                    placeholder="E-posta adresiniz"
                    className="w-full px-4 py-2 rounded-lg border border-emerald-300 mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800">
                    Abone Ol
                  </Button>
                </div>

                {/* Popular Posts */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-gray-900 mb-4">Popüler Yazılar</h3>
                  <div className="space-y-4">
                    {blogPosts.slice(0, 3).map((popularPost) => (
                      <button
                        key={popularPost.id}
                        onClick={() => navigate(`/blog/${popularPost.id}`)}
                        className="flex gap-3 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors w-full"
                      >
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={popularPost.image}
                            alt={popularPost.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-900 text-sm line-clamp-2 mb-1">
                            {popularPost.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{popularPost.date}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-16 border-t border-gray-200">
              <h2 className="text-gray-900 mb-8">İlgili Yazılar</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <article
                    key={relatedPost.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group cursor-pointer"
                    onClick={() => navigate(`/blog/${relatedPost.id}`)}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <ImageWithFallback
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-gray-900 text-lg mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{relatedPost.readTime}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
