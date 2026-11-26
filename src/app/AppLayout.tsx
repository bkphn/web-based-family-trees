import type { ReactNode } from 'react'

type AppLayoutProps = {
  children: ReactNode
  overlay?: ReactNode
}

export default function AppLayout({ children, overlay }: AppLayoutProps) {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-white text-slate-900">
      <div className="absolute inset-0">
        {children}
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        {overlay}
      </div>
    </main>
  )
}
