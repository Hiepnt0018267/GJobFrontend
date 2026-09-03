import { createContext, useContext } from 'react'

const WorkspaceShellContext = createContext(false)

export const WorkspaceShellProvider = WorkspaceShellContext.Provider

export function useWorkspaceShell(): boolean {
  return useContext(WorkspaceShellContext)
}
