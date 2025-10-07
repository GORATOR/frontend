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
    EnvelopeEventExtras: EnvelopeEventExtra[]
    Project?: Project
    ProjectID?: number
}

interface EnvelopeEventExtra {
    Data: string
}

export type { Envelope, EnvelopeEventExtra, SDK }