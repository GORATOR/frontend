<script setup lang="ts">
import { ref } from 'vue'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/Sidebar.vue'
import { Envelope } from '../../models/envelope'
import Paging from '../../components/paging/Paging.vue'
import { EntityCount } from '../../models/count.ts'
import { PageSelectEvent } from '../../models/pagingPageSelect.ts'
import Issue from '../../components/issue/Issue.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import {loadIssues, loadOrganizations} from "../../service/loadList.ts";

const list = ref<Envelope[]>([])
const loaded = ref(false)

const count = ref<EntityCount>({ count: 0 })
const page = ref(1)
const offset = ref(0)

async function loadCount() {
    try {
        const response = await sendGet("/envelopes/count")
        if (response.status == 200) {
            const data = await response.json()
            count.value = data
        }
    } catch (err) {
        console.error('Error:', err)
    }
}

async function pageSelect(e: PageSelectEvent) {
    page.value = e.page
    offset.value = e.offset
    list.value = await loadIssues(loaded, offset.value);
}

async function initLoad() {
    await loadCount()
    list.value = await loadIssues(loaded, offset.value);
}

initLoad()
</script>

<template>
    <Sidebar :active=MenuItem.Issues>
        <template v-if="loaded">
            <h2>Issues</h2>

            <div class="issue-container">
                <div v-for="envelope in list" class="issue">
                    <Issue :envelope=envelope />
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