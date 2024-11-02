<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/sidebar.vue'
import { Team } from '../../models/team'
import { gotoTeamsNew } from '../../utils/redirects.ts'

const router = useRouter()
const list = ref<Team[]>([])
const loading = ref(false)
const create = () => gotoTeamsNew(router)

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

        <button @click="create">CREATE</button>
    </Sidebar>
</template>