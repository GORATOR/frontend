import {sendGet} from "../utils/requests.ts";

export interface IssueStatEntry {
    date: string;
    count: number;
}

export async function loadIssuesStats(days: number = 14): Promise<IssueStatEntry[]> {
    try {
        const response = await sendGet(`/issues/stats?days=${days}`);
        if (response.status == 200) {
            return await response.json();
        }
    } catch (err) {
        console.error('Error loading issue stats:', err);
    }
    return [];
}
