interface Project {
    Name: string,
    ID: number
}

interface ProjectCreate {
    Name: string,
    TeamId: number,
}

interface ProjectUpdate {
    ID: number
    Name: string,
    TeamId: number,
}

export type { Project, ProjectCreate, ProjectUpdate }