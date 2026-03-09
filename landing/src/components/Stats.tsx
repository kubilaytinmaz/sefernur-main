import { Users, Hotel, Star, Globe } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: 'Mutlu Misafir',
    color: 'from-emerald-500 to-emerald-700'
  },
  {
    icon: Hotel,
    value: '50+',
    label: 'Partner Otel',
    color: 'from-teal-500 to-teal-700'
  },
  {
    icon: Star,
    value: '4.8/5',
    label: 'Kullanıcı Puanı',
    color: 'from-cyan-500 to-cyan-700'
  },
  {
    icon: Globe,
    value: '15+',
    label: 'Yıllık Deneyim',
    color: 'from-green-500 to-green-700'
  }
];

export function Stats() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-white mb-4">
            Rakamlarla Sefernur
          </h2>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
            Binlerce kullanıcının güvendiği, yıllardır hizmet veren 
            Türkiye'nin önde gelen Hac & Umre platformu.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} mb-4`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl md:text-4xl text-white mb-2">{stat.value}</div>
              <div className="text-emerald-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
