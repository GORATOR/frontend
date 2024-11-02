<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/sidebar.vue'
import { Team } from '../../models/team';

const router = useRouter()
const list = ref<Team[]>([])
const loading = ref(false)

const gotoCreate = () => router.push({ path: "/teams/new" })

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

        <button @click="gotoCreate">CREATE</button>
    </Sidebar>
</template>