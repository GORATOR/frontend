<script setup lang="ts">
import { ref } from 'vue'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/sidebar.vue'
import { Team } from '../../models/team'
import { redirectTeamsNew } from '../../utils/redirects.ts'
import Button from '../../components/button.vue'
import Table from '../../components/table.vue'
import { EntityCount } from '../../models/count.ts'

const count = ref<EntityCount>()
const list = ref<Team[]>([])
const loaded = ref(false)

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
        const response = await sendGet("/teams?limit=10")
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

loadData()
</script>

<template>
    <Sidebar>
        <template v-if="loaded">
            <h2>Teams</h2>

            <Table :rows="list.map(x => x.Name)" />

            <p>COUNT {{ count?.count }}</p>

            <div class="padding-small">
                <Button @click="redirectTeamsNew">CREATE</Button>
            </div>
        </template>
    </Sidebar>
</template>