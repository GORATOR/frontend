interface StackFrame {
    filename: string
    abs_path: string
    function: string
    module: string
    lineno: number
    pre_context?: string[]
    context_line?: string
    post_context?: string[]
    vars?: Record<string, string>
    in_app?: boolean
}

interface ExceptionValue {
    mechanism?: {
        type: string
        handled: boolean
    }
    module: string | null
    type: string
    value: string
    stacktrace?: {
        frames: StackFrame[]
    }
}

interface Context {
    trace?: {
        trace_id: string
        span_id: string
        parent_span_id: string | null
    }
    runtime?: {
        name: string
        version: string
        build?: string
    }
}

interface EnvelopeException {
    level: string
    exception: {
        values: ExceptionValue[]
    } | ExceptionValue[]
    event_id: string
    timestamp: string
    contexts?: Context
    breadcrumbs?: {
        values: any[]
    }
    extra?: Record<string, any>
    modules?: Record<string, string>
    environment?: string
    server_name?: string
    sdk?: {
        name: string
        version: string
        packages?: Array<{ name: string; version: string }>
        integrations?: string[]
    }
    platform?: string
}

export type { EnvelopeException, ExceptionValue, StackFrame, Context }