import type { Team } from './team';
import type { User } from './user';

interface Organization {
    Name: string,
    Avatar?: string,
    TeamIds?: Array<number>,
    UserIds?: Array<number>,
    Teams?: Array<Team>,
    Users?: Array<User>,
    ID: number,
}

export type { Organization }