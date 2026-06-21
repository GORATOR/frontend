import { Ref } from 'vue'
import { sendGet } from '../utils/requests.ts'
import { Transaction, TraceDetail } from '../models/trace.ts'

export async function loadTraces(loaded: Ref<boolean>, projectId?: string): Promise<Transaction[]> {
  loaded.value = false
  try {
    let url = '/traces'
    if (projectId) url += `?projectId=${encodeURIComponent(projectId)}`
    const response = await sendGet(url)
    if (response.status === 200) {
      const data = await response.json()
      loaded.value = true
      return data || []
    }
  } catch (err) {
    console.error('Error loading traces:', err)
  }
  return []
}

export async function loadTracesCount(projectId?: string): Promise<number> {
  try {
    let url = '/traces/count'
    if (projectId) url += `?projectId=${encodeURIComponent(projectId)}`
    const response = await sendGet(url)
    if (response.status === 200) {
      const data = await response.json()
      return data.count || 0
    }
  } catch (err) {
    console.error('Error loading traces count:', err)
  }
  return 0
}

export async function loadTrace(traceId: string): Promise<TraceDetail | null> {
  try {
    const response = await sendGet(`/trace/${encodeURIComponent(traceId)}`)
    if (response.status === 200) {
      return await response.json()
    }
  } catch (err) {
    console.error('Error loading trace:', err)
  }
  return null
}
