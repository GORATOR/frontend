interface User {
    Username: string,
    Email: string,
    ID: number,
    TeamIds: Array<number>,
    OrganizationIds: Array<number>
}

interface UserCreate {
    Username: string,
    Email: string,
    Password: string,
    TeamIds: Array<number>,
    OrganizationIds: Array<number>
}

export type { User, UserCreate }