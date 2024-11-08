<script setup lang="ts">
import { ref } from 'vue'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/sidebar.vue'
import { Organization } from '../../models/organization'
import { redirectOrganizationsNew } from '../../utils/redirects.ts'

const list = ref<Organization[]>([])
const loading = ref(false)

async function loadList() {
    loading.value = true
    try {
        const response = await sendGet("/organizations")
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
        <h2>Organizations</h2>

        <ul>
            <li v-for="item in list">
                {{ item.Name }}
            </li>
        </ul>

        <button @click="redirectOrganizationsNew">CREATE</button>
    </Sidebar>
</template>