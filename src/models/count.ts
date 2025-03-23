export enum EntityName {
    User = 'user',
    Project = 'project',
    Organization = 'organization',
    Team = 'team',
    Envelope = 'envelope',
}

interface EntityCount {
    count: number
    entity: EntityName
}

export type { EntityCount }