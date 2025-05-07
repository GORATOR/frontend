interface Team {
    Name: string,
    Avatar: string,
    OrganizationIds: Array<number> | undefined,
    ProjectIds: Array<number> | undefined,
    UserIds: Array<number> | undefined,
    ID: number,
}

export type { Team }