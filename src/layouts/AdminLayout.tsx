import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminMobileDrawer from '../components/admin/layout/AdminMobileDrawer'
import AdminSidebar from '../components/admin/layout/AdminSidebar'
import AdminTopbar from '../components/admin/layout/AdminTopbar'
import PageTransition from '../components/motion/PageTransition'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'

export default function AdminLayout() {
  const { pathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useSidebarCollapsed('gjob.admin.sidebar-collapsed')

  useEffect(() => {
    const frame = requestAnimationFrame(() => { setDrawerOpen(false); setSidebarHovered(false) })
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [])

  const toggleDrawer = () => { setDrawerOpen((open) => !open); setAccountOpen(false) }
  const toggleAccount = () => { setAccountOpen((open) => !open); setDrawerOpen(false) }

  return <div className={`min-h-screen bg-slate-50 lg:grid lg:transition-[grid-template-columns] lg:duration-[var(--motion-normal)] lg:ease-[var(--ease-gjob)] ${sidebarCollapsed && !sidebarHovered ? 'lg:grid-cols-[4.5rem_minmax(0,1fr)]' : 'lg:grid-cols-[15rem_minmax(0,1fr)]'}`}><AdminSidebar collapsed={sidebarCollapsed} hoverExpanded={sidebarHovered} onHoverChange={setSidebarHovered} onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)} /><div className="min-w-0"><AdminTopbar drawerOpen={drawerOpen} accountOpen={accountOpen} onToggleDrawer={toggleDrawer} onToggleAccount={toggleAccount} onCloseAccount={() => setAccountOpen(false)} /><div className="min-w-0"><PageTransition><Outlet /></PageTransition></div></div><AdminMobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} /></div>
}
