import {sendGet} from "../utils/requests.ts";

export interface IssueStatEntry {
    date: string;
    count: number;
}

export async function loadIssuesStats(
    interval: 'minute' | 'hour' | 'day' | 'week' = 'day',
    periods: number = 14,
    projectIds?: string[],
    eventType?: string
): Promise<IssueStatEntry[]> {
    try {
        const params = [`interval=${interval}`, `periods=${periods}`];

        if (projectIds && projectIds.length > 0) {
            params.push(`projectIds=${projectIds.map(id => encodeURIComponent(id)).join(',')}`);
        }
        if (eventType) {
            params.push(`eventType=${encodeURIComponent(eventType)}`);
        }

        const response = await sendGet(`/issues/stats?${params.join('&')}`);
        if (response.status == 200) {
            return await response.json();
        }
    } catch (err) {
        console.error('Error loading issue stats:', err);
    }
    return [];
}
