import type { User } from './user';

type RuleAction = 'create' | 'read' | 'update' | 'delete';
type RuleTable = 'roles' | 'teams' | 'projects' | 'organizations' | 'users' | 'envelope_event_commons' | 'transactions';

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
const RULE_TABLES: RuleTable[] = ['roles', 'teams', 'projects', 'organizations', 'users', 'envelope_event_commons', 'transactions'];

// Per-table overrides for the rules matrix. "transactions" is the RBAC entity
// behind the Traces pages: it is read-only, so it exposes only the read action
// and is displayed under its user-facing name.
const RULE_TABLE_LABELS: Partial<Record<RuleTable, string>> = {
    transactions: 'Traces'
};

const RULE_TABLE_ACTIONS: Partial<Record<RuleTable, RuleAction[]>> = {
    transactions: ['read']
};

function getTableLabel(table: RuleTable): string | undefined {
    return RULE_TABLE_LABELS[table];
}

function getTableActions(table: RuleTable): RuleAction[] {
    return RULE_TABLE_ACTIONS[table] ?? RULE_ACTIONS;
}

export type { Role, Rule, RuleAction, RuleTable }
export { RULE_ACTIONS, RULE_TABLES, getTableLabel, getTableActions }
