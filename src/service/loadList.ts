import {Ref} from "vue";
import {sendGet} from "../utils/requests.ts";
import {Team} from "../models/team.ts";
import {Project} from "../models/project.ts";
import {User} from "../models/user.ts";
import {Organization} from "../models/organization.ts";
import {Envelope} from "../models/envelope.ts";

async function loadList(loaded:Ref<boolean, boolean>, endpoint: string, offset: number, limit = 10, search?: string) : Promise<Array<any>> {
    loaded.value = false
    try {
        let url = `/${endpoint}?limit=${limit}&offset=${offset}`
        if (search && search.trim() !== '') {
            url += `&search=${encodeURIComponent(search)}`
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

export async function loadTeams(loaded:Ref<boolean, boolean>, offset: number, limit = 10, search?: string) : Promise<Team[]> {
    return loadList(loaded, 'teams', offset, limit, search);
}

export async function loadProjects(loaded:Ref<boolean, boolean>, offset: number, limit = 10, search?: string): Promise<Project[]> {
    return loadList(loaded, 'projects', offset, limit, search);
}

export async function loadUsers(loaded:Ref<boolean, boolean>, offset: number, limit = 10, search?: string): Promise<User[]> {
    return loadList(loaded, 'users', offset, limit, search);
}

export async function loadOrganizations(loaded:Ref<boolean, boolean>, offset: number, limit = 10, search?: string): Promise<Organization[]> {
    return await loadList(loaded, 'organizations', offset, limit, search);
}

export async function loadIssues(loaded:Ref<boolean, boolean>, offset: number, limit = 10, search?: string): Promise<Envelope[]> {
    return loadList(loaded, 'envelopes', offset, limit, search);
}

