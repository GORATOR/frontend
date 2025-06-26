import {sendPut} from "../utils/requests.ts";
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
import {ProjectCreate} from "../models/project.ts";
import {User} from "../models/user.ts";


async function updateEntity(loading: Ref<boolean, boolean>, name: EntityName, obj: any, redirectCallback: Function ): Promise<boolean> {
    loading.value = true;

    try {
        const response = await sendPut(`/${name}`, obj);

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

export async function updateTeam(loading: Ref<boolean, boolean>, obj: Team): Promise<boolean> {
    return updateEntity(loading, EntityName.Team, obj, redirectTeamsList);
}

export async function updateProject(loading: Ref<boolean, boolean>, obj: ProjectCreate): Promise<boolean> {
    return updateEntity(loading, EntityName.Project, obj, redirectProjectsList);
}

export async function updateOrganization(loading: Ref<boolean, boolean>, obj: Organization): Promise<boolean> {
    return updateEntity(loading, EntityName.Organization, obj, redirectOrganizationsList);
}

export async function updateUser(loading: Ref<boolean, boolean>, obj: User): Promise<boolean> {
    return updateEntity(loading, EntityName.User, obj, redirectUsersList);
}