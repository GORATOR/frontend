<script setup lang="ts">
import { ref } from 'vue'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/Sidebar.vue'
import { Envelope } from '../../models/envelope'
import Button from '../../components/Button.vue'
import Table from '../../components/Table.vue'
import Paging from '../../components/paging/Paging.vue'
import { EntityCount } from '../../models/count.ts'
import { PageSelectEvent } from '../../models/pagingPageSelect.ts'

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

async function loadList() {
    loaded.value = false
    try {
        const response = await sendGet("/envelopes?limit=10&offset=" + offset.value)
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
            <h2>Issues</h2>

            <Table
                :headers="['EventId', 'Sdk']"
                :rows="list.map(x => ({ EventId: x.event_id, Sdk: x.sdk }))"
                :indexOffset="offset" />

            <Paging :page="page" :limit="10" :count="count.count" v-on:page-select="pageSelect" />
        </template>
    </Sidebar>
</template>

<style scoped lang="scss">
.padding-small {
    padding-top: 14px;
}
</style>