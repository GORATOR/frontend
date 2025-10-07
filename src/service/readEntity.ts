import {EntityName} from "../models/count.ts";
import {sendGet} from "../utils/requests.ts";

// Map entity names to URL paths (for extracting ID from URL)
const entityToUrlMap: Record<EntityName, string> = {
    [EntityName.Envelope]: 'issue',
    [EntityName.User]: 'user',
    [EntityName.Project]: 'project',
    [EntityName.Organization]: 'organization',
    [EntityName.Team]: 'team',
};

export function getEntityId(e: EntityName): number {
    const urlPath = entityToUrlMap[e] || e;
    return Number.parseInt(location.pathname.replace(`/${urlPath}/`, ''));
}

export async function readEntity(e: EntityName, id: number) : Promise<any> {
    const apiPath = entityToUrlMap[e] || e;
    const response = await sendGet(`/${apiPath}/${id}`);
    if (response.status == 200) {
        return await response.json();
    }
}

export function generateEntityRecordUrl(e: EntityName, id: number): string {
    return `${location.origin}/${e}/${id}`;
}