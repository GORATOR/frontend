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

function buildCountUrl(type: string, projectIds?: string[], createdAtFrom?: string, eventType?: string): string {
    const params = [];
    if (projectIds && projectIds.length > 0) {
        params.push(`projectIds=${projectIds.map(id => encodeURIComponent(id)).join(',')}`);
    }
    if (createdAtFrom) {
        params.push(`createdAtFrom=${encodeURIComponent(createdAtFrom)}`);
    }
    if (eventType) {
        params.push(`eventType=${encodeURIComponent(eventType)}`);
    }

    let url = `/${type}/count`;
    if (params.length > 0) {
        url += `?${params.join('&')}`;
    }
    return url;
}

export async function loadTotalEventsCount(projectIds?: string[], createdAtFrom?: string, eventType?: string): Promise<number> {
    try {
        const response = await sendGet(buildCountUrl('envelopes', projectIds, createdAtFrom, eventType));
        if (response.status == 200) {
            const data: EntityCount = await response.json();
            return data.count;
        }
    } catch (err) {
        console.error('Error loading total events count:', err);
    }
    return 0;
}

export async function loadIssueEventsCount(issueId: number): Promise<number> {
    try {
        const response = await sendGet(`/issue/${issueId}/events/count`);
        if (response.status == 200) {
            const data: EntityCount = await response.json();
            return data.count;
        }
    } catch (err) {
        console.error('Error loading issue events count:', err);
    }
    return 0;
}

export async function loadAggregatedIssuesCount(projectIds?: string[], createdAtFrom?: string, eventType?: string): Promise<EntityCount> {
    try {
        const response = await sendGet(buildCountUrl('issues-aggregated', projectIds, createdAtFrom, eventType));
        if (response.status == 200) {
            return await response.json();
        }
    } catch (err) {
        console.error('Error:', err);
    }
    return <EntityCount>{count: 0, entity: 'envelope'};
}



