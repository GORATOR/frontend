import type { User } from './user';

type RuleAction = 'create' | 'read' | 'update' | 'delete';
type RuleTable = 'roles' | 'teams' | 'projects' | 'organizations' | 'users' | 'envelope_event_commons';

interface Rule {
    ID?: number,
    Action: RuleAction,
    Allowed: boolean,
    Table: RuleTable
}

interface Role {
    ID: number,
    Name: string,
    UserIds?: Array<number>,
    Users?: Array<User>,
    Rules?: Array<Rule>,
    CreatedAt?: string,
    UpdatedAt?: string,
    DeletedAt?: string
}

const RULE_ACTIONS: RuleAction[] = ['create', 'read', 'update', 'delete'];
const RULE_TABLES: RuleTable[] = ['roles', 'teams', 'projects', 'organizations', 'users', 'envelope_event_commons'];

export type { Role, Rule, RuleAction, RuleTable }
export { RULE_ACTIONS, RULE_TABLES }
