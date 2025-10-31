<script setup lang="ts">
import {ref, computed} from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import Paging from '../../components/paging/Paging.vue'
import Issue from '../../components/issue/Issue.vue'
import {EntityCount, EntityName} from '../../models/count.ts'
import {PageSelectEvent} from '../../models/pagingPageSelect.ts'
import IssueChart from '../../components/issue/IssueChart.vue'
import {MenuItem} from '../../models/sidebarMenuItem.ts'
import {loadIssuesAggregated, AggregatedIssue, loadProjects} from "../../service/loadList.ts";
import {loadAggregatedIssuesCount} from "../../service/loadCount.ts";
import MultiSelectBox from '../../components/MultiSelectBox.vue'
import SelectBox from '../../components/SelectBox.vue'
import {SelectBoxOption} from '../../models/SelectBoxOption.ts'
import {Project} from '../../models/project.ts'
import {TIME_RANGE_CONFIGS, getTimeRangeConfig, getCreatedAtFrom} from '../../config/timeRangeConfig'

const list = ref<AggregatedIssue[]>([])
const loaded = ref(false)

const count = ref<EntityCount>({ count: 0, entity: EntityName.Envelope })
const page = ref(1)
const offset = ref(0)
const sortBy = ref<string>('count')
const sortOrder = ref<string>('DESC')

// Filters state
const selectedProjectIds = ref<string[]>([])
const projects = ref<Project[]>([])
const projectsLoaded = ref(false)
const projectsLoading = ref(false)
const projectsOffset = ref(0)
const hasMoreProjects = ref(true)

// Time filter state
const selectedTimeRange = ref<string>('14d')

// Generate time range options from config
const timeRangeOptions = computed<SelectBoxOption[]>(() => {
    return Object.values(TIME_RANGE_CONFIGS).map(config => ({
        value: config.value,
        label: config.label
    }))
})

const sortLabel = computed(() => {
    if (sortBy.value === 'count') {
        return sortOrder.value === 'DESC' ? 'Count ↓' : 'Count ↑';
    }
    return 'Count';
})

const projectOptions = computed<SelectBoxOption[]>(() => {
    return projects.value.map((project) => ({
        value: project.ID.toString(),
        label: project.Name
    }));
})

// Chart configuration based on selected time range
const chartConfig = computed(() => {
    const config = getTimeRangeConfig(selectedTimeRange.value)
    return {
        interval: config.interval,
        periods: config.periods,
        label: config.label
    }
})

async function loadProjectsData(resetOffset = false) {
    if (resetOffset) {
        projectsOffset.value = 0;
        projects.value = [];
    }

    projectsLoading.value = true;
    const newProjects = await loadProjects(projectsLoaded, projectsOffset.value, 20);

    if (resetOffset) {
        projects.value = newProjects;
    } else {
        projects.value = [...projects.value, ...newProjects];
    }

    hasMoreProjects.value = newProjects.length === 20;
    projectsOffset.value += newProjects.length;
    projectsLoading.value = false;
}

async function loadMoreProjects() {
    if (!projectsLoading.value && hasMoreProjects.value) {
        await loadProjectsData();
    }
}

async function searchProjects(query: string) {
    projectsOffset.value = 0;
    projects.value = [];
    projectsLoading.value = true;
    const newProjects = await loadProjects(projectsLoaded, 0, 20, query);
    projects.value = newProjects;
    hasMoreProjects.value = newProjects.length === 20;
    projectsOffset.value = newProjects.length;
    projectsLoading.value = false;
}

async function onProjectFilterChange() {
    offset.value = 0;
    page.value = 1;
    const createdAtFrom = getCreatedAtFrom(selectedTimeRange.value);
    count.value = await loadAggregatedIssuesCount(
        selectedProjectIds.value.length > 0 ? selectedProjectIds.value : undefined,
        createdAtFrom
    );
    list.value = await loadIssuesAggregated(
        loaded,
        offset.value,
        10,
        sortBy.value === 'first_id' ? undefined : sortBy.value,
        sortBy.value === 'first_id' ? undefined : sortOrder.value,
        selectedProjectIds.value.length > 0 ? selectedProjectIds.value : undefined,
        createdAtFrom
    );
}

async function onTimeRangeChange() {
    offset.value = 0;
    page.value = 1;
    const createdAtFrom = getCreatedAtFrom(selectedTimeRange.value);
    count.value = await loadAggregatedIssuesCount(
        selectedProjectIds.value.length > 0 ? selectedProjectIds.value : undefined,
        createdAtFrom
    );
    list.value = await loadIssuesAggregated(
        loaded,
        offset.value,
        10,
        sortBy.value === 'first_id' ? undefined : sortBy.value,
        sortBy.value === 'first_id' ? undefined : sortOrder.value,
        selectedProjectIds.value.length > 0 ? selectedProjectIds.value : undefined,
        createdAtFrom
    );
}

async function pageSelect(e: PageSelectEvent) {
    page.value = e.page
    offset.value = e.offset
    const createdAtFrom = getCreatedAtFrom(selectedTimeRange.value);
    list.value = await loadIssuesAggregated(
        loaded,
        offset.value,
        10,
        sortBy.value === 'first_id' ? undefined : sortBy.value,
        sortBy.value === 'first_id' ? undefined : sortOrder.value,
        selectedProjectIds.value.length > 0 ? selectedProjectIds.value : undefined,
        createdAtFrom
    );
}

async function toggleSort() {
    // Cycle through: count DESC -> count ASC -> first_id DESC (no sort)
    if (sortBy.value === 'first_id') {
        sortBy.value = 'count';
        sortOrder.value = 'DESC';
    } else if (sortBy.value === 'count' && sortOrder.value === 'DESC') {
        sortOrder.value = 'ASC';
    } else {
        sortBy.value = 'first_id';
        sortOrder.value = 'DESC';
    }

    offset.value = 0;
    page.value = 1;
    const createdAtFrom = getCreatedAtFrom(selectedTimeRange.value);
    list.value = await loadIssuesAggregated(
        loaded,
        offset.value,
        10,
        sortBy.value === 'first_id' ? undefined : sortBy.value,
        sortBy.value === 'first_id' ? undefined : sortOrder.value,
        selectedProjectIds.value.length > 0 ? selectedProjectIds.value : undefined,
        createdAtFrom
    );
}

async function initLoad() {
    const createdAtFrom = getCreatedAtFrom(selectedTimeRange.value);
    count.value = await loadAggregatedIssuesCount(
        selectedProjectIds.value.length > 0 ? selectedProjectIds.value : undefined,
        createdAtFrom
    );
    list.value = await loadIssuesAggregated(
        loaded,
        offset.value,
        10,
        sortBy.value,
        sortOrder.value,
        selectedProjectIds.value.length > 0 ? selectedProjectIds.value : undefined,
        createdAtFrom
    );
    await loadProjectsData(true);
}

initLoad()
</script>

<template>
    <Sidebar :active=MenuItem.Issues>
        <template v-if="loaded">
            <h2>Issues</h2>

            <div class="filters-block">
                <h3>Filters</h3>
                <div class="filters-container">
                    <SelectBox
                        label="Time Range"
                        :options="timeRangeOptions"
                        v-model="selectedTimeRange"
                        @changed="onTimeRangeChange"
                    />
                    <MultiSelectBox
                        label="Projects"
                        :options="projectOptions"
                        :loading="projectsLoading"
                        :hasMore="hasMoreProjects"
                        v-model="selectedProjectIds"
                        @changed="onProjectFilterChange"
                        @loadMore="loadMoreProjects"
                        @search="searchProjects"
                    />
                </div>
            </div>

          <IssueChart
              :interval="chartConfig.interval"
              :periods="chartConfig.periods"
              :label="chartConfig.label"
              :projectIds="selectedProjectIds"
          />

            <div class="issues-table">
                <div class="table-header">
                    <div class="header-cell issue-type">Exception Type</div>
                    <div class="header-cell issue-value">Exception Value</div>
                    <div class="header-cell issue-chart">Chart (7 days)</div>
                    <div class="header-cell issue-count sortable" @click="toggleSort">
                        {{ sortLabel }}
                    </div>
                </div>
                <div class="issue-container">
                    <div v-for="item in list" class="issue">
                        <Issue :envelope="item.envelope" :count="item.count" />
                    </div>
                </div>
            </div>

            <Paging :page="page" :limit="10" :count="count.count" v-on:page-select="pageSelect" />
        </template>
    </Sidebar>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as *;

.padding-small {
    padding-top: 14px;
}

.filters-block {
    margin: 20px 0;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid $main_theme_border_color;

    h3 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 18px;
        color: $main_theme_border_color_darker1;
    }

    .filters-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
    }
}

.issues-table {
    border: 1px solid $main_theme_border_color;
    border-radius: 5px;
    overflow: hidden;
}

.table-header {
    display: flex;
    background-color: $main_theme_border_color_lighter1;
    color: $main_theme_border_color_darker1;
    padding: 15px 10px;
    font-weight: bold;
    border-bottom: 1px solid $main_theme_border_color;
}

.header-cell {
    padding: 0 5px;

    &.issue-type {
        flex: 0 0 150px;
    }

    &.issue-value {
        flex: 1;
        min-width: 0;
    }

    &.issue-chart {
        flex: 0 0 120px;
    }

    &.issue-count {
        flex: 0 0 100px;
        text-align: right;
    }

    &.sortable {
        cursor: pointer;
        user-select: none;

        &:hover {
            color: rgb(0, 106, 255);
        }
    }
}

.issue {
    border-top: 1px solid $main_theme_border_color;

    &:first-child {
        border-top: none;
    }
}
</style>