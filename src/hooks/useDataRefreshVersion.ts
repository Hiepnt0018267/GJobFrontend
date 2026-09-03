import { useContext } from 'react'
import { DataRefreshContext } from '../contexts/dataRefreshState'

export function useDataRefreshVersion(): number {
  return useContext(DataRefreshContext)
}
