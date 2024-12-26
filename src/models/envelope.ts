interface Envelope {
    EnvelopeEventExtras: EnvelopeEventExtra[]
}

interface EnvelopeEventExtra {
    Data: string
}

export type { Envelope, EnvelopeEventExtra }