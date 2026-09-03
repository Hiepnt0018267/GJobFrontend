import type { ComponentType } from 'react'
import { Outlet } from 'react-router-dom'
import PageTransition from '../components/motion/PageTransition'
import { WorkspaceShellProvider } from './workspaceShellContext'

type Props = {
  Header: ComponentType
}

export default function WorkspaceLayout({ Header }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <WorkspaceShellProvider value>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </WorkspaceShellProvider>
    </div>
  )
}
