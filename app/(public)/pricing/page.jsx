// app/(public)/pricing/page.jsx
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: 'Gratis',
    limit: '100 req/hari',
    features: ['Akses API Dasar', 'Rate Limit Ketat', 'Support Komunitas'],
    buttonLabel: 'Pakai Gratis',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'VIP',
    price: 'Rp20.000',
    period: '/bulan',
    limit: '500 req/hari',
    features: ['Semua API Dasar', 'API Key Permanen', 'Support Prioritas'],
    buttonLabel: 'Pilih Paket',
    href: '/upgrade?plan=vip',
    highlighted: false,
  },
  {
    name: 'Lord',
    price: 'Rp50.000',
    period: '/bulan',
    limit: '1.500 req/hari',
    features: ['Semua API Premium', 'Webhook Pribadi', 'Custom Endpoint Request'],
    buttonLabel: 'Pilih Paket',
    href: '/upgrade?plan=lord',
    highlighted: false,
  },
  {
    name: "King's",
    price: 'Rp120.000',
    period: '/bulan',
    limit: 'Unlimited',
    features: ['Semua API + Beta', 'Dedicated Server', 'API Key Kustom', 'Support 24/7'],
    buttonLabel: 'Kontak Admin',
    href: '/upgrade?plan=kings',
    highlighted: true,
    slotsLeft: 3,
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white">Pilih Paket Layanan</h1>
        <p className="text-gray-400 mt-3">Tingkatkan kapasitas API-mu dengan role yang sesuai.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-xl border bg-[#111111] p-6 transition-shadow hover:shadow-xl ${
              plan.highlighted
                ? 'border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.15)]' // glow emas untuk King's
                : 'border-[#333333]'
            }`}
          >
            {/* Badge slot terbatas untuk King's */}
            {plan.slotsLeft && (
              <span className="absolute -top-3 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                {plan.slotsLeft} Slot Tersisa
              </span>
            )}

            <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              {plan.period && <span className="text-gray-400 text-sm">{plan.period}</span>}
            </div>

            <p className="text-sm text-gray-400 mb-4">Limit: {plan.limit}</p>

            <ul className="space-y-2 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <svg className="w-4 h-4 mt-0.5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={`block text-center py-3 rounded-lg font-semibold transition-colors ${
                plan.highlighted
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {plan.buttonLabel}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
