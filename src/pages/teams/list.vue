<script setup lang="ts">
import { ref } from 'vue'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/sidebar.vue'
import { Team } from '../../models/team'
import { gotoTeamsNew } from '../../utils/redirects.ts'

const list = ref<Team[]>([])
const loading = ref(false)

async function loadList() {
    loading.value = true
    try {
        const response = await sendGet("/teams")
        if (response.status == 200) {
            const data = await response.json()
            list.value = data
        }
    } finally {
        loading.value = false
    }
}

loadList()
</script>

<template>
    <Sidebar>
        <ul>
            <li v-for="item in list">
                {{ item.Name }}
            </li>
        </ul>

        <button @click="gotoTeamsNew">CREATE</button>
    </Sidebar>
</template>