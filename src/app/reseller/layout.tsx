import Sidebar from '@/components/sidebar'
import MobileNav from '@/components/mobile-nav'
import MobileHeader from '@/components/mobile-header'

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Mobile header — hanya tampil di mobile */}
      <MobileHeader />

      <div className="lg:flex lg:min-h-screen">
        {/* Sidebar — hanya tampil di desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 page-mobile lg:p-8 lg:overflow-auto">
          {children}
        </main>
      </div>

      {/* Bottom nav — hanya tampil di mobile */}
      <MobileNav />
    </div>
  )
}
