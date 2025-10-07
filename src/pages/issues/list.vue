<script setup lang="ts">
import {ref} from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import Paging from '../../components/paging/Paging.vue'
import {EntityCount, EntityName} from '../../models/count.ts'
import {PageSelectEvent} from '../../models/pagingPageSelect.ts'
import Issue from '../../components/issue/Issue.vue'
import IssueChart from '../../components/issue/IssueChart.vue'
import {MenuItem} from '../../models/sidebarMenuItem.ts'
import {loadIssuesAggregated, AggregatedIssue} from "../../service/loadList.ts";
import {loadAggregatedIssuesCount} from "../../service/loadCount.ts";

const list = ref<AggregatedIssue[]>([])
const loaded = ref(false)

const count = ref<EntityCount>({ count: 0, entity: EntityName.Envelope })
const page = ref(1)
const offset = ref(0)

async function pageSelect(e: PageSelectEvent) {
    page.value = e.page
    offset.value = e.offset
    list.value = await loadIssuesAggregated(loaded, offset.value);
}

async function initLoad() {
    count.value = await loadAggregatedIssuesCount();
    list.value = await loadIssuesAggregated(loaded, offset.value);
}

initLoad()
</script>

<template>
    <Sidebar :active=MenuItem.Issues>
        <template v-if="loaded">
            <h2>Issues</h2>

            <IssueChart :days="14" />

            <div class="issue-container">
                <div v-for="item in list" class="issue">
                    <Issue :envelope="item.envelope" :count="item.count" />
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

.issue {
    border: 1px solid $main_theme_border_color;
    border-top: none;

    &:first-child {
        border-top: 1px solid $main_theme_border_color;
    }
}
</style>