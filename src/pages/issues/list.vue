<script setup lang="ts">
import {ref, computed} from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import Paging from '../../components/paging/Paging.vue'
import Issue from '../../components/issue/Issue.vue'
import {EntityCount, EntityName} from '../../models/count.ts'
import {PageSelectEvent} from '../../models/pagingPageSelect.ts'
import IssueChart from '../../components/issue/IssueChart.vue'
import {MenuItem} from '../../models/sidebarMenuItem.ts'
import {loadIssuesAggregated, AggregatedIssue} from "../../service/loadList.ts";
import {loadAggregatedIssuesCount} from "../../service/loadCount.ts";

const list = ref<AggregatedIssue[]>([])
const loaded = ref(false)

const count = ref<EntityCount>({ count: 0, entity: EntityName.Envelope })
const page = ref(1)
const offset = ref(0)
const sortBy = ref<string>('count')
const sortOrder = ref<string>('DESC')

const sortLabel = computed(() => {
    if (sortBy.value === 'count') {
        return sortOrder.value === 'DESC' ? 'Count ↓' : 'Count ↑';
    }
    return 'Count';
})

async function pageSelect(e: PageSelectEvent) {
    page.value = e.page
    offset.value = e.offset
    list.value = await loadIssuesAggregated(
        loaded,
        offset.value,
        10,
        sortBy.value === 'first_id' ? undefined : sortBy.value,
        sortBy.value === 'first_id' ? undefined : sortOrder.value
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
    list.value = await loadIssuesAggregated(
        loaded,
        offset.value,
        10,
        sortBy.value === 'first_id' ? undefined : sortBy.value,
        sortBy.value === 'first_id' ? undefined : sortOrder.value
    );
}

async function initLoad() {
    count.value = await loadAggregatedIssuesCount();
    list.value = await loadIssuesAggregated(
        loaded,
        offset.value,
        10,
        sortBy.value,
        sortOrder.value
    );
}

initLoad()
</script>

<template>
    <Sidebar :active=MenuItem.Issues>
        <template v-if="loaded">
            <h2>Issues</h2>

          <IssueChart :days="14"/>

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