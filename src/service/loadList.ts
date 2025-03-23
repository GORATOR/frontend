import {Ref} from "vue";
import {sendGet} from "../utils/requests.ts";
import {Team} from "../models/team.ts";
import {Project} from "../models/project.ts";
import {User} from "../models/user.ts";
import {Organization} from "../models/organization.ts";
import {Envelope} from "../models/envelope.ts";

async function loadList(loaded:Ref<boolean, boolean>, endpoint: string, offset: number, limit = 10) : Promise<Array<any>> {
    loaded.value = false
    try {
        const response = await sendGet(`/${endpoint}?limit=${limit}&offset=${offset}`)
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

export async function loadTeams(loaded:Ref<boolean, boolean>, offset: number, limit = 10) : Promise<Team[]> {
    return loadList(loaded, 'teams', offset, limit);
}

export async function loadProjects(loaded:Ref<boolean, boolean>, offset: number, limit = 10): Promise<Project[]> {
    return loadList(loaded, 'projects', offset, limit);
}

export async function loadUsers(loaded:Ref<boolean, boolean>, offset: number, limit = 10): Promise<User[]> {
    return loadList(loaded, 'users', offset, limit);
}

export async function loadOrganizations(loaded:Ref<boolean, boolean>, offset: number, limit = 10): Promise<Organization[]> {
    return await loadList(loaded, 'organizations', offset, limit);
}

export async function loadIssues(loaded:Ref<boolean, boolean>, offset: number, limit = 10): Promise<Envelope[]> {
    return loadList(loaded, 'envelopes', offset, limit);
}

