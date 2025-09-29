interface ProjectInput {
    Name: string,
    TeamId: number,
    Avatar: string
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
    Avatar: string
}

export type { Project, ProjectInput, ProjectCreate, ProjectUpdate }