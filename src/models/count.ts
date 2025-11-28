export enum EntityName {
    User = 'user',
    Project = 'project',
    Organization = 'organization',
    Team = 'team',
    Envelope = 'envelope',
    Role = 'role',
}

interface EntityCount {
    count: number
    entity: EntityName
}

export type { EntityCount }