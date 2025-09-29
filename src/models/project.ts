interface ProjectInput {
    Name: string,
    TeamId: number
}

interface Project extends ProjectInput {
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

export type { Project, ProjectInput, ProjectCreate, ProjectUpdate }