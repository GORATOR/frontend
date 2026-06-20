import { Project } from './project'

interface Span {
  ID: number
  span_id: string
  parent_span_id: string
  trace_id: string
  transaction_id: number
  op: string
  description: string
  status: string
  start_timestamp: string
  end_timestamp: string
  data?: string | null
}

interface Transaction {
  ID: number
  event_id: string
  trace_id: string
  span_id: string
  parent_span_id: string
  name: string
  op: string
  status: string
  start_timestamp: string
  end_timestamp: string
  project_id?: number
  project?: Project
  spans: Span[]
  contexts?: string | null
  tags?: string | null
}

interface TraceDetail {
  trace_id: string
  transactions: Transaction[]
}

export type { Span, Transaction, TraceDetail }
