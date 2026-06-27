import { Shield, Award, Zap, Clock } from 'lucide-react'

export default function TrustBar() {
  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">
          Dipercaya dan Didukung Oleh
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {/* Partner Logos / Trust Signals */}
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">Digiflazz</p>
              <p className="text-xs text-gray-400">H2H Provider</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">SSL Encrypted</p>
              <p className="text-xs text-gray-400">256-bit Security</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">24/7 Online</p>
              <p className="text-xs text-gray-400">Server Uptime</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">Terpercaya</p>
              <p className="text-xs text-gray-400">Sejak 2024</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
