import {Project} from './project.ts'

interface SDK {
    ID: number
    name: string
    version: string
}

interface Envelope {
    ID: number
    CreatedAt: string
    UpdatedAt: string
    event_id: string
    sent_at: string
    dsn: string
    sdk?: SDK
    EnvelopeEventExtras?: EnvelopeEventExtra[]
    project?: Project
    ProjectID?: number
    exception_type?: string
    exception_value?: string
    exception_data?: string
    message?: string
    level?: string
}

interface EnvelopeEventExtra {
    Data: string
}

export type { Envelope, EnvelopeEventExtra, SDK }