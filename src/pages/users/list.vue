<script setup lang="ts">
import { ref } from 'vue'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/sidebar.vue'
import { redirectUsersNew } from '../../utils/redirects.ts'
import { User } from '../../models/user.ts'
import Button from '../../components/button.vue'

const list = ref<User[]>([])
const loaded = ref(false)

async function loadList() {
    try {
        const response = await sendGet("/users")
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
            <h2>Users</h2>

            <ul>
                <li v-for="item in list">
                    {{ item.Username }}
                </li>
            </ul>

            <Button @click="redirectUsersNew">CREATE</Button>
        </template>
    </Sidebar>
</template>