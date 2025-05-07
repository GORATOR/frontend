interface Project {
    Name: string,
    ID: number
}

interface ProjectCreate {
    Name: string,
    TeamId: number,
}

export type { Project, ProjectCreate }