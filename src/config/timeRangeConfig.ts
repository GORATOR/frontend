/**
 * Time Range Configuration
 *
 * This configuration defines how different time ranges are displayed in charts and filters.
 * Easy to modify for future adjustments - just update the values in this config.
 *
 * Each time range has:
 * - interval: The granularity of data points (minute/hour/day/week)
 * - periods: Number of data points to display on the chart
 * - label: Display label for the filter dropdown
 */

export interface TimeRangeConfig {
    value: string;
    label: string;
    interval: 'minute' | 'hour' | 'day' | 'week';
    periods: number;
}

export const TIME_RANGE_CONFIGS: Record<string, TimeRangeConfig> = {
    'all': {
        value: 'all',
        label: 'All the time',
        interval: 'day',
        periods: 30  // Show last 30 days on chart even when showing all issues
    },
    '1h': {
        value: '1h',
        label: 'Last hour',
        interval: 'minute',
        periods: 12  // 12 x 5-minute intervals
    },
    '24h': {
        value: '24h',
        label: 'Last 24 hours',
        interval: 'hour',
        periods: 24  // 24 x 1-hour intervals
    },
    '7d': {
        value: '7d',
        label: 'Last 7 days',
        interval: 'day',
        periods: 7  // 7 x 1-day intervals
    },
    '14d': {
        value: '14d',
        label: 'Last 14 days',
        interval: 'day',
        periods: 14  // 14 x 1-day intervals
    },
    '30d': {
        value: '30d',
        label: 'Last 30 days',
        interval: 'day',
        periods: 30  // 30 x 1-day intervals
    },
    '90d': {
        value: '90d',
        label: 'Last 90 days',
        interval: 'week',
        periods: 13  // 13 x 1-week intervals (91 days)
    }
};

// Helper function to get config for a time range
export function getTimeRangeConfig(value: string): TimeRangeConfig {
    return TIME_RANGE_CONFIGS[value] || TIME_RANGE_CONFIGS['14d'];
}

// Helper function to calculate createdAtFrom date
// Returns undefined for 'all' to disable time filtering
export function getCreatedAtFrom(timeRange: string): string | undefined {
    // No time filter for 'all'
    if (timeRange === 'all') {
        return undefined;
    }

    const now = new Date();
    let date: Date;

    switch (timeRange) {
        case '1h':
            date = new Date(now.getTime() - 60 * 60 * 1000);
            break;
        case '24h':
            date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case '7d':
            date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case '14d':
            date = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case '90d':
            date = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        default:
            date = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    }

    return date.toISOString();
}
