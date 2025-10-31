import {sendGet} from "../utils/requests.ts";
import {EntityCount} from "../models/count.ts";

export default async function loadCount(entity: string): Promise<EntityCount> {
    try {
        const response = await sendGet(`/${entity}s/count`);
        if (response.status == 200) {
            return await response.json();
        }
    } catch (err) {
        console.error('Error:', err);
    }
    return <EntityCount>{count: 0, entity: entity};
}

export async function loadAggregatedIssuesCount(projectIds?: string[]): Promise<EntityCount> {
    try {
        let url = '/issues-aggregated/count';
        if (projectIds && projectIds.length > 0) {
            url += `?projectIds=${projectIds.map(id => encodeURIComponent(id)).join(',')}`;
        }
        const response = await sendGet(url);
        if (response.status == 200) {
            return await response.json();
        }
    } catch (err) {
        console.error('Error:', err);
    }
    return <EntityCount>{count: 0, entity: 'envelope'};
}



