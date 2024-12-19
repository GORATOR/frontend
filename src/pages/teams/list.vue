<script setup lang="ts">
import { ref } from 'vue'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/Sidebar.vue'
import { Team } from '../../models/team'
import { redirectTeamsNew } from '../../utils/redirects.ts'
import Button from '../../components/Button.vue'
import Table from '../../components/Table.vue'
import Paging from '../../components/paging/Paging.vue'
import { EntityCount } from '../../models/count.ts'
import { PageSelectEvent } from '../../models/pagingPageSelect.ts'

const list = ref<Team[]>([])
const loaded = ref(false)

const count = ref<EntityCount>({ count: 0 })
const page = ref(1)
const offset = ref(0)

async function loadCount() {
    try {
        const response = await sendGet("/teams/count")
        if (response.status == 200) {
            const data = await response.json()
            count.value = data
        }
    } catch (err) {
        console.error('Error:', err)
    }
}

async function loadList() {
    loaded.value = false
    try {
        const response = await sendGet("/teams?limit=10&offset=" + offset.value)
        if (response.status == 200) {
            const data = await response.json()
            list.value = data
            loaded.value = true
        }
    } catch (err) {
        console.error('Error:', err)
    }
}

async function pageSelect(e: PageSelectEvent)
{
    page.value = e.page
    offset.value = e.offset
    await loadList()
}

async function initLoad() {
    await loadCount()
    await loadList()
}

initLoad()
</script>

<template>
    <Sidebar>
        <template v-if="loaded">
            <h2>Teams</h2>

            <Table :rows="list.map(x => x.Name)" :indexOffset="offset" />

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