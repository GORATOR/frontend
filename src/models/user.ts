import type { Team } from './team';
import type { Organization } from './organization';
import type { Role } from './role';

interface User {
    Username: string,
    Email: string,
    Avatar?: string,
    ID: number,
    TeamIds?: Array<number>,
    OrganizationIds?: Array<number>,
    RoleIds?: Array<number>,
    Teams?: Array<Team>,
    Organizations?: Array<Organization>,
    Roles?: Array<Role>
}

interface UserCreate {
    Username: string,
    Email: string,
    Password: string,
    TeamIds: Array<number>,
    OrganizationIds: Array<number>
}

export type { User, UserCreate }