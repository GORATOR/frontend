<script setup lang="ts">
import { ref } from 'vue'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/sidebar.vue'
import { Team } from '../../models/team'
import { redirectTeamsNew } from '../../utils/redirects.ts'
import Button from '../../components/button.vue'
import Table from '../../components/table.vue'
import Paging from '../../components/paging/Paging.vue'
import { EntityCount } from '../../models/count.ts'
import { PageSelectEvent } from '../../models/pagingPageSelect.ts'

const count = ref<EntityCount>()
const list = ref<Team[]>([])
const loaded = ref(false)
const page = ref(1)
const offset = ref(0)

async function loadCount() {
    try {
        const response = await sendGet("/teams/count")
        if (response.status == 200) {
            const data = await response.json()
            count.value = data
        }
        return true
    } catch (err) {
        console.error('Error:', err)
        return false
    }
}

async function loadList() {
    try {
        const response = await sendGet("/teams?limit=10&offset=" + offset.value)
        if (response.status == 200) {
            const data = await response.json()
            list.value = data
        }
        return true
    } catch (err) {
        console.error('Error:', err)
        return false
    }
}

async function loadData() {
    if (!await loadCount()) return
    if (!await loadList()) return
    loaded.value = true
}

async function pageSelect(e: PageSelectEvent)
{
    page.value = e.page
    offset.value = e.offset
    loaded.value = false
    await loadList()
    loaded.value = true
}

loadData()
</script>

<template>
    <Sidebar>
        <template v-if="loaded">
            <h2>Teams</h2>

            <Table :rows="list.map(x => x.Name)" />

            <Paging :page=page :limit=10 :count="count!.count" v-on:page-select="pageSelect" />

            <div class="padding-small">
                <Button @click="redirectTeamsNew">CREATE</Button>
            </div>
        </template>
    </Sidebar>
</template>