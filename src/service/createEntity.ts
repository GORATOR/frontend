import {sendPost} from "../utils/requests.ts";
import {EntityName} from "../models/count.ts";
import {Ref} from "vue";
import {Team} from "../models/team.ts";
import {
    redirectOrganizationsList,
    redirectProjectsList,
    redirectTeamsList,
    redirectUsersList
} from "../utils/redirects.ts";
import {Organization} from "../models/organization.ts";
import {ProjectUpdate} from "../models/project.ts";
import {User} from "../models/user.ts";


async function createEntity(loading: Ref<boolean, boolean>, name: EntityName, obj: any, redirectCallback: Function ): Promise<boolean> {
    loading.value = true;

    try {
        const response = await sendPost(`/${name}`, obj);

        if (response.status != 200) {
            console.error('Invalid response:', response);
            return false;
        }

        redirectCallback();
        return true;
    }
    catch (err) {
        console.error('Error:', err);
    }
    finally {
        loading.value = false;
    }

    return false;
}

export async function createTeam(loading: Ref<boolean, boolean>, obj: Team): Promise<boolean> {
    return createEntity(loading, EntityName.Team, obj, redirectTeamsList);
}

export async function createProject(loading: Ref<boolean, boolean>, obj: ProjectUpdate): Promise<boolean> {
    return createEntity(loading, EntityName.Project, obj, redirectProjectsList);
}

export async function createOrganization(loading: Ref<boolean, boolean>, obj: Organization): Promise<boolean> {
    return createEntity(loading, EntityName.Organization, obj, redirectOrganizationsList);
}

export async function createUser(loading: Ref<boolean, boolean>, obj: User): Promise<boolean> {
    return createEntity(loading, EntityName.User, obj, redirectUsersList);
}
