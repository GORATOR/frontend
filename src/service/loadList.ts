import {Ref} from "vue";
import {sendGet} from "../utils/requests.ts";
import {Team} from "../models/team.ts";
import {Project} from "../models/project.ts";
import {User} from "../models/user.ts";
import {Organization} from "../models/organization.ts";
import {Envelope} from "../models/envelope.ts";
import {Role} from "../models/role.ts";

async function loadList(loaded:Ref<boolean, boolean>, endpoint: string, offset: number, limit = 10, search?: string) : Promise<Array<any>> {
    loaded.value = false
    try {
        let url = `/${endpoint}?limit=${limit}&offset=${offset}`
        if (search && search.trim() !== '') {
            url += `&${encodeURIComponent(search)}`
        }
        const response = await sendGet(url)
        if (response.status == 200) {
            const data = await response.json();
            loaded.value = true;
            return data;
        }
    } catch (err) {
        console.error('Error:', err);
    }
    return [];
}

function addURIComponent(name: string, value?: string): string {
    let result = '';
    if (value && value.trim() !== '') {
        result = `${name}=${encodeURIComponent(value)}`
    }
    return result;
}

export async function loadTeams(loaded:Ref<boolean, boolean>, offset: number, limit = 10, name?: string) : Promise<Team[]> {
    return loadList(loaded, 'teams', offset, limit, addURIComponent('name', name));
}

export async function loadProjects(loaded:Ref<boolean, boolean>, offset: number, limit = 10, name?: string): Promise<Project[]> {
    return loadList(loaded, 'projects', offset, limit, addURIComponent('name', name));
}

export async function loadUsers(loaded:Ref<boolean, boolean>, offset: number, limit = 10, username?: string): Promise<User[]> {
    return loadList(loaded, 'users', offset, limit, addURIComponent('username', username));
}

export async function loadOrganizations(loaded:Ref<boolean, boolean>, offset: number, limit = 10, name?: string): Promise<Organization[]> {
    return await loadList(loaded, 'organizations', offset, limit, addURIComponent('name', name));
}

export async function loadRoles(loaded:Ref<boolean, boolean>, offset: number, limit = 10, name?: string): Promise<Role[]> {
    return await loadList(loaded, 'roles', offset, limit, addURIComponent('name', name));
}

export async function loadIssues(
    loaded:Ref<boolean, boolean>,
    offset: number,
    limit = 10,
    groupBy?: string,
    createdAtFrom?: string,
    createdAtTo?: string): Promise<Envelope[]> {
    const search = [];

    if (groupBy === 'tag') {
        search.push(`groupBy=${encodeURIComponent(groupBy)}`);
    }
    if (createdAtFrom) {
        search.push(`createdAtFrom=${encodeURIComponent(createdAtFrom)}`);
    }
    if (createdAtTo) {
        search.push(`createdAtFrom=${encodeURIComponent(createdAtTo)}`);
    }
    return loadList(loaded, 'envelopes', offset, limit, search.join('&'));
}

export interface AggregatedIssue {
    envelope: Envelope;
    count: number;
    event_type: 'exception' | 'message';
}

export async function loadIssuesAggregated(
    loaded:Ref<boolean, boolean>,
    offset: number,
    limit = 10,
    sortBy?: string,
    sortOrder?: string,
    projectIds?: string[],
    createdAtFrom?: string,
    eventType?: string): Promise<AggregatedIssue[]> {
    const search = [];

    if (sortBy) {
        search.push(`sortBy=${encodeURIComponent(sortBy)}`);
    }
    if (sortOrder) {
        search.push(`sortOrder=${encodeURIComponent(sortOrder)}`);
    }
    if (projectIds && projectIds.length > 0) {
        search.push(`projectIds=${projectIds.map(id => encodeURIComponent(id)).join(',')}`);
    }
    if (createdAtFrom) {
        search.push(`createdAtFrom=${encodeURIComponent(createdAtFrom)}`);
    }
    if (eventType) {
        search.push(`eventType=${encodeURIComponent(eventType)}`);
    }

    loaded.value = false;
    try {
        let url = `/issues-aggregated?limit=${limit}&offset=${offset}`;
        if (search.length > 0) {
            url += `&${search.join('&')}`;
        }
        const response = await sendGet(url);
        if (response.status == 200) {
            const data = await response.json();
            loaded.value = true;
            return data;
        }
    } catch (err) {
        console.error('Error:', err);
    }
    return [];
}

