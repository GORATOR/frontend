import {EntityName} from "../models/count.ts";
import {sendGet} from "../utils/requests.ts";

export function getEntityId(e: EntityName): number {
    return Number.parseInt(location.pathname.replace(`/${e}/`, ''));
}

export async function readEntity(e: EntityName, id: number) : Promise<any> {
    const response = await sendGet(`/${e}/${id}`);
    if (response.status == 200) {
        return await response.json();
    }
}

export function generateEntityRecordUrl(e: EntityName, id: number): string {
    return `${location.origin}/${e}/${id}`;
}