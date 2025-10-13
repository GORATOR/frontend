import type { User } from './user';
import type { Organization } from './organization';
import type { Project } from './project';

interface Team {
    Name: string,
    Avatar: string,
    OrganizationIds?: Array<number>,
    ProjectIds?: Array<number>,
    UserIds?: Array<number>,
    Organizations?: Array<Organization>,
    Projects?: Array<Project>,
    Users?: Array<User>,
    ID: number,
}

export type { Team }