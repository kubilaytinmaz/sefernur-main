import { Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const testimonials = [
  {
    name: 'Ayşe Yılmaz',
    role: 'İstanbul',
    rating: 5,
    comment: 'Sefernur sayesinde Umre yolculuğum çok kolay ve sorunsuz geçti. Tüm rezervasyonlarımı tek yerden yapabilmek harika bir deneyimdi.',
    avatar: '👩🏻'
  },
  {
    name: 'Mehmet Demir',
    role: 'Ankara',
    rating: 5,
    comment: 'Vize başvuru sürecim çok hızlı ilerledi. Uygulamadaki adım adım rehber gerçekten çok yardımcı oldu. Herkese tavsiye ederim.',
    avatar: '👨🏻'
  },
  {
    name: 'Fatma Kaya',
    role: 'İzmir',
    rating: 5,
    comment: 'Otel rezervasyonları için harika fiyatlar bulduk. Yorumlar ve fotoğraflar sayesinde doğru oteli seçmek çok kolaylaştı.',
    avatar: '👩🏻‍🦱'
  }
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-emerald-100 rounded-full mb-4">
            <span className="text-emerald-700">Kullanıcı Yorumları</span>
          </div>
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">
            Müşterilerimiz Ne Diyor?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sefernur ile manevi yolculuklarına çıkan binlerce 
            kullanıcımızın deneyimlerini okuyun.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.comment}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
