<script setup lang="ts">
import { ref } from 'vue'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/sidebar.vue'
import { Team } from '../../models/team'
import { redirectTeamsNew } from '../../utils/redirects.ts'
import Button from '../../components/button.vue'

const list = ref<Team[]>([])
const loaded = ref(false)

async function loadList() {
    try {
        const response = await sendGet("/teams")
        if (response.status == 200) {
            const data = await response.json()
            list.value = data
            loaded.value = true
        }
    } catch (err) {
        console.error('Error:', err)
    }
}

loadList()
</script>

<template>
    <Sidebar>
        <template v-if="loaded">
            <h2>Teams</h2>

            <ul>
                <li v-for="item in list">
                    {{ item.Name }}
                </li>
            </ul>

            <Button @click="redirectTeamsNew">CREATE</Button>
        </template>
    </Sidebar>
</template>