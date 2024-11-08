<script setup lang="ts">
import { ref } from 'vue'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/sidebar.vue'
import { redirectUsersNew } from '../../utils/redirects.ts'
import { User } from '../../models/user.ts'

const list = ref<User[]>([])
const loading = ref(false)

async function loadList() {
    loading.value = true
    try {
        const response = await sendGet("/users")
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
        <h2>Users</h2>

        <ul>
            <li v-for="item in list">
                {{ item.Username }}
            </li>
        </ul>

        <button @click="redirectUsersNew">CREATE</button>
    </Sidebar>
</template>