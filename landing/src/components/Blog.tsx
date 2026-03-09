import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, User, ArrowRight, Clock, Tag } from 'lucide-react';

export const blogPosts = [
  {
    id: 'umre-hazirlik-rehberi',
    title: 'Umre İçin Hazırlık Rehberi: Bilmeniz Gereken Her Şey',
    excerpt: 'Umre yolculuğuna çıkmadan önce hazırlık sürecinde dikkat etmeniz gereken önemli noktalar ve pratik öneriler.',
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Rehber',
    author: 'Ahmet Yılmaz',
    date: '15 Kasım 2024',
    readTime: '8 dakika',
    content: `
      <h2>Umre Hazırlığında İlk Adımlar</h2>
      <p>Umre, müslümanların hayatında özel bir yere sahip manevi bir yolculuktur. Bu kutsal yolculuğa çıkmadan önce iyi bir hazırlık yapmak, deneyiminizi çok daha anlamlı hale getirecektir.</p>
      
      <h3>Vize ve Evrak İşlemleri</h3>
      <p>Umre vizesi almak için gerekli evraklar:</p>
      <ul>
        <li>En az 6 ay geçerlilik süresi olan pasaport</li>
        <li>Son 6 ay içinde çekilmiş biyometrik fotoğraf</li>
        <li>Aşı kartı (Meningokok aşısı zorunlu)</li>
        <li>Otel rezervasyon belgesi</li>
        <li>Uçak bileti</li>
      </ul>

      <h3>Sağlık Hazırlığı</h3>
      <p>Seyahat öncesi mutlaka:</p>
      <ul>
        <li>Genel sağlık kontrolü yaptırın</li>
        <li>Zorunlu aşıları tamamlayın</li>
        <li>İlaçlarınızı yeterli miktarda yanınıza alın</li>
        <li>Seyahat sigortası yaptırın</li>
      </ul>

      <h3>Bavul Hazırlığı</h3>
      <p>Yanınıza alınması gerekenler:</p>
      <ul>
        <li>İhram takımı (erkekler için)</li>
        <li>Rahat giysiler ve ayakkabılar</li>
        <li>Kişisel bakım ürünleri</li>
        <li>Dua kitabı ve tespih</li>
        <li>Güneş kremi ve şemsiye</li>
      </ul>

      <h3>Manevi Hazırlık</h3>
      <p>Umre öncesi manevi olarak hazırlanmak da çok önemlidir. Umre menasikini öğrenin, dua ve zikirleri ezberleyin, niyetinizi samimi yapın.</p>
    `
  },
  {
    id: 'ramazan-umresi',
    title: 'Ramazan Ayında Umre: Özel Bir Tecrübe',
    excerpt: 'Ramazan ayının bereketinde yapılan umrenin manevi atmosferi ve dikkat edilmesi gereken özel hususlar.',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Deneyim',
    author: 'Fatma Demir',
    date: '10 Kasım 2024',
    readTime: '6 dakika',
    content: `
      <h2>Ramazan Umresinin Önemi</h2>
      <p>Ramazan ayında yapılan umre, diğer aylara göre çok daha fazla sevap kazandıran mübarek bir ibadettir. Hz. Peygamber (s.a.v), Ramazan'da yapılan umrenin bir hac sevabı kazandıracağını müjdelemiştir.</p>

      <h3>Ramazan Umresinin Özellikleri</h3>
      <p>Ramazan ayında Mekke ve Medine özel bir atmosfere bürünür:</p>
      <ul>
        <li>Mescid-i Haram ve Mescid-i Nebevi'de teravih namazları</li>
        <li>Mukabele dinleme imkanı</li>
        <li>İftar ve sahur programları</li>
        <li>Kadir Gecesi'ni Harem'de idrak etme fırsatı</li>
      </ul>

      <h3>Hazırlık Önerileri</h3>
      <p>Ramazan umresi için özel hazırlıklar:</p>
      <ul>
        <li>Oruçlu olarak seyahat edebilecek fiziksel kondisyonda olun</li>
        <li>Yoğunluk nedeniyle erken rezervasyon yapın</li>
        <li>İftar ve sahur saatlerini öğrenin</li>
        <li>Ramazan ayına özgü duaları ezberleyin</li>
      </ul>

      <h3>Programınızı Planlayın</h3>
      <p>Ramazan umresinde gün içi ibadetler, iftar ve teravih için zaman planlaması yapmanız önemlidir. Özellikle Kadir Gecesi için özel program oluşturun.</p>
    `
  },
  {
    id: 'hac-menasiki',
    title: 'Hac Menasiki: Adım Adım Hac İbadeti',
    excerpt: 'Hac ibadetinin tüm aşamaları, rukünleri ve vacipleri ile eksiksiz bir rehber.',
    image: 'https://images.unsplash.com/photo-1704104501136-8f35402af395?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Eğitim',
    author: 'Mehmet Özkan',
    date: '5 Kasım 2024',
    readTime: '12 dakika',
    content: `
      <h2>Hac İbadetine Giriş</h2>
      <p>Hac, İslam'ın beş şartından biridir ve gücü yeten her müslüman için ömründe bir kez farzdır.</p>

      <h3>Haccın Farzları (Rükünleri)</h3>
      <ul>
        <li><strong>İhram:</strong> Mikattan ihrama girmek</li>
        <li><strong>Vakfe:</strong> Arafat'ta vakfe yapmak</li>
        <li><strong>Tavaf-ı Ziyaret:</strong> Bayramın ilk üç günü içinde tavaf yapmak</li>
        <li><strong>Sa'y:</strong> Safa ile Merve arasında sa'y yapmak</li>
      </ul>

      <h3>Haccın Vacipleri</h3>
      <ul>
        <li>Arafat'ta güneş battıktan sonra Müzdelife'ye gitmek</li>
        <li>Müzdelife'de gecenin bir kısmını geçirmek</li>
        <li>Şeytan taşlamak (cemrelere taş atmak)</li>
        <li>Erkekler için traş olmak veya saç kısaltmak</li>
        <li>Veda tavafı yapmak</li>
      </ul>

      <h3>Günlere Göre Hac Programı</h3>
      <p><strong>8. Gün (Terviye):</strong> Mina'ya gidilir, orada namaz kılınır ve gecelenir.</p>
      <p><strong>9. Gün (Arefe):</strong> Sabah Arafat'a gidilir, öğle namazından güneş batana kadar vakfe yapılır.</p>
      <p><strong>10. Gün (Kurban Bayramı):</strong> Büyük cemreye taş atılır, kurban kesilir, saç traşı olunur.</p>
      <p><strong>11-12-13. Günler (Teşrik):</strong> Mina'da gecelenilir, cemrelere taş atılır.</p>
    `
  },
  {
    id: 'mekke-medine-gezilecek-yerler',
    title: 'Mekke ve Medine\'de Gezilecek Tarihi Yerler',
    excerpt: 'Kutsal topraklarda ziyaret edilmesi gereken tarihi ve manevi mekanların detaylı rehberi.',
    image: 'https://images.unsplash.com/photo-1564769610726-5c4c90f99c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Gezi',
    author: 'Ayşe Kaya',
    date: '1 Kasım 2024',
    readTime: '10 dakika',
    content: `
      <h2>Mekke'de Ziyaret Edilecek Yerler</h2>
      
      <h3>Mescid-i Haram ve Çevresi</h3>
      <ul>
        <li><strong>Kabe-i Muazzama:</strong> Müslümanların kıblesi</li>
        <li><strong>Hacer-ül Esved:</strong> Kabe'nin köşesindeki kutsal taş</li>
        <li><strong>Zemzem Kuyusu:</strong> Kutsal su kaynağı</li>
        <li><strong>Makam-ı İbrahim:</strong> Hz. İbrahim'in ayak izi</li>
      </ul>

      <h3>Mekke Çevresindeki Önemli Mekanlar</h3>
      <ul>
        <li><strong>Hıra Mağarası:</strong> İlk vahyin indiği yer</li>
        <li><strong>Sevr Mağarası:</strong> Hz. Peygamber'in hicret sırasında saklandığı mağara</li>
        <li><strong>Mina:</strong> Hac menasikinin yapıldığı vadi</li>
        <li><strong>Arafat:</strong> Haccın en önemli rüknü olan vakfenin yapıldığı yer</li>
        <li><strong>Müzdelife:</strong> Arafat ile Mina arasındaki alan</li>
      </ul>

      <h2>Medine'de Ziyaret Edilecek Yerler</h2>

      <h3>Mescid-i Nebevi ve Çevresi</h3>
      <ul>
        <li><strong>Ravza-i Mutahhara:</strong> Hz. Peygamber'in kabri</li>
        <li><strong>Ravza-i Şerife:</strong> Cennet bahçesi olarak bilinen alan</li>
        <li><strong>Minber-i Şerif:</strong> Hz. Peygamber'in minberi</li>
      </ul>

      <h3>Medine'deki Diğer Önemli Mekanlar</h3>
      <ul>
        <li><strong>Kuba Mescidi:</strong> İslam'da kurulan ilk mescit</li>
        <li><strong>Uhud Dağı:</strong> Uhud Savaşı'nın yapıldığı yer</li>
        <li><strong>Cennetü'l Baki:</strong> Sahabelerin kabirlerinin bulunduğu mezarlık</li>
        <li><strong>Kıble Mescidi:</strong> Kıblenin değiştiği yer</li>
      </ul>
    `
  },
  {
    id: 'umre-masraflari',
    title: 'Umre Masrafları: Bütçe Planlama Rehberi',
    excerpt: 'Umre seyahati için gerekli bütçe, harcama kalemleri ve tasarruf önerileri.',
    image: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Planlama',
    author: 'Ali Yıldız',
    date: '28 Ekim 2024',
    readTime: '7 dakika',
    content: `
      <h2>Umre Maliyetleri</h2>
      <p>Umre seyahatinin toplam maliyeti, seçtiğiniz paket tipine, seyahat süresine ve konaklamanın kalitesine göre değişiklik gösterir.</p>

      <h3>Ana Harcama Kalemleri</h3>
      <ul>
        <li><strong>Uçak Bileti:</strong> 15.000 - 30.000 TL</li>
        <li><strong>Vize İşlemleri:</strong> 2.000 - 3.000 TL</li>
        <li><strong>Otel Konaklama:</strong> 10.000 - 50.000 TL</li>
        <li><strong>Transferler:</strong> 1.000 - 3.000 TL</li>
        <li><strong>Yemek:</strong> 5.000 - 10.000 TL</li>
        <li><strong>Rehberlik Hizmeti:</strong> Pakete dahil</li>
      </ul>

      <h3>Paket Seçenekleri ve Fiyatları</h3>
      <p><strong>Ekonomik Paket (7 gün):</strong> 45.000 - 55.000 TL</p>
      <p><strong>Standart Paket (10 gün):</strong> 65.000 - 75.000 TL</p>
      <p><strong>Lüks Paket (14 gün):</strong> 95.000 - 120.000 TL</p>

      <h3>Ek Harcamalar</h3>
      <ul>
        <li>Hediyelik eşya ve alışveriş</li>
        <li>Kişisel harcamalar</li>
        <li>Ek turlar ve ziyaretler</li>
        <li>İletişim (roaming, internet)</li>
      </ul>

      <h3>Tasarruf Önerileri</h3>
      <ul>
        <li>Erken rezervasyon yaparak indirimlerden yararlanın</li>
        <li>Sezon dışı dönemleri tercih edin</li>
        <li>Grup turlarına katılın</li>
        <li>Otel mesafelerini değerlendirin</li>
      </ul>
    `
  },
  {
    id: 'umre-sonrasi',
    title: 'Umre Sonrası: Manevi Kazanımları Korumak',
    excerpt: 'Umre dönüşü manevi kazanımları hayatınızda nasıl sürdürebilirsiniz? Pratik öneriler.',
    image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Manevi',
    author: 'Zeynep Arslan',
    date: '25 Ekim 2024',
    readTime: '5 dakika',
    content: `
      <h2>Umre Sonrası Manevi Hayat</h2>
      <p>Umre, sadece bir seyahat değil, aynı zamanda bir dönüşüm sürecidir. Orada yaşadığınız manevi atmosferi normal hayatınıza taşımak çok önemlidir.</p>

      <h3>İbadetlerde Devamlılık</h3>
      <ul>
        <li>Beş vakit namazı cemaatle kılmaya devam edin</li>
        <li>Gece namazlarını ihmal etmeyin</li>
        <li>Kur'an okumayı alışkanlık haline getirin</li>
        <li>Zikir ve dualarınızı sürdürün</li>
      </ul>

      <h3>Davranış Değişiklikleri</h3>
      <ul>
        <li>Günahlardan sakının</li>
        <li>İyilik ve hayır işlerine devam edin</li>
        <li>Sabır ve tevekküle sarılın</li>
        <li>İnsanlara karşı hoşgörülü olun</li>
      </ul>

      <h3>Tecrübelerinizi Paylaşın</h3>
      <p>Umre tecrübelerinizi çevrenizle paylaşın, ancak gösterişten kaçının. İnsanları hayra teşvik edin.</p>

      <h3>Şükür ve Dua</h3>
      <p>Allah'a bu mübarek yolculuğu nasip ettiği için şükredin. Tekrar gidebilmek için dua edin ve başkalarının da gitmesi için vesile olun.</p>

      <h3>Hediyeler ve Anılar</h3>
      <p>Getirdiğiniz zemzem suyunu bereketli kullanın. Sevdiklerinize dağıttığınız hediyelerde samimi olun.</p>
    `
  }
];

export function Blog() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ['Tümü', 'Rehber', 'Deneyim', 'Eğitim', 'Gezi', 'Planlama', 'Manevi'];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-white mb-4 text-4xl md:text-5xl">Blog</h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              Hac ve Umre seyahatleri hakkında bilgilendirici yazılar, rehberler ve deneyimler
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'Tümü' ? 'default' : 'outline'}
                size="sm"
                className={category === 'Tümü' 
                  ? 'bg-emerald-700 hover:bg-emerald-800 flex-shrink-0' 
                  : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex-shrink-0'
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group cursor-pointer"
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm">
                    {post.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  {/* Read More */}
                  <Button 
                    variant="ghost" 
                    className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 p-0 h-auto group/btn"
                  >
                    Devamını Oku
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="mt-16 bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-white mb-4">Blog Güncellemelerini Kaçırmayın</h2>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              Yeni yazılarımızdan ve özel içeriklerimizden haberdar olmak için e-posta listemize katılın.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
              <Button className="bg-white text-emerald-700 hover:bg-emerald-50 px-8">
                Abone Ol
              </Button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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
