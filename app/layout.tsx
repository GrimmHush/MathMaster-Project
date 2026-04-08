import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MathQuest Neon',
  description: 'An adaptive, high-speed math challenge',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen text-white overflow-x-hidden bg-gray-950">
        
        {/* Dynamic, Vibrant Rotating Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="absolute w-[150vw] h-[150vw] md:w-[100vw] md:h-[100vw] animate-[spin_40s_linear_infinite] opacity-60 mix-blend-screen">
            {/* Purple Orb */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-purple-600/40 rounded-full blur-[120px]"></div>
            {/* Cyan Orb */}
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-cyan-500/40 rounded-full blur-[120px]"></div>
            {/* Blue center Orb */}
            <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-blue-600/40 rounded-full blur-[120px] transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        
        {/* Subtle Grid Overlay */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDQwIEwgNDAgNDAgTCA0MCAwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50 mix-blend-overlay"></div>
        
        {/* Main Content Wrapper */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}