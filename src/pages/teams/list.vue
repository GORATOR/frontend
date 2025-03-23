<script setup lang="ts">
import {ref} from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import {Team} from '../../models/team'
import {redirectTeamsNew} from '../../utils/redirects.ts'
import Button from '../../components/Button.vue'
import Table from '../../components/Table.vue'
import Paging from '../../components/paging/Paging.vue'
import {EntityCount, EntityName} from '../../models/count.ts'
import {PageSelectEvent} from '../../models/pagingPageSelect.ts'
import {MenuItem} from '../../models/sidebarMenuItem.ts'
import {loadTeams} from "../../service/loadList.ts";
import loadCount from "../../service/loadCount.ts";

const list = ref<Team[]>([])
const loaded = ref(false)

const count = ref<EntityCount>({ count: 0, entity: EntityName.Team })
const page = ref(1)
const offset = ref(0)

async function pageSelect(e: PageSelectEvent)
{
    page.value = e.page
    offset.value = e.offset
    list.value = await loadTeams(loaded, offset.value);
}

async function initLoad() {
    count.value = await loadCount(count.value.entity);
    list.value = await loadTeams(loaded, offset.value);
}

initLoad()
</script>

<template>
    <Sidebar :active=MenuItem.Teams>
        <template v-if="loaded">
            <h2>Teams</h2>

            <Table
                :headers="['Name']"
                :rows="list.map(x => ({ Name: x.Name }))" />

            <Paging :page="page" :limit="10" :count="count.count" v-on:page-select="pageSelect" />

            <div class="padding-small">
                <Button @click="redirectTeamsNew">CREATE</Button>
            </div>
        </template>
    </Sidebar>
</template>

<style scoped lang="scss">
.padding-small {
    padding-top: 14px;
}
</style>