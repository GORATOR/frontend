<script setup lang="ts">
import { ref } from 'vue'
import { sendGet } from '../../utils/requests'
import Sidebar from '../../components/sidebar.vue'
import { Organization } from '../../models/organization'
import { redirectOrganizationsNew } from '../../utils/redirects.ts'
import Button from '../../components/button.vue'
import Table from '../../components/table.vue'

const list = ref<Organization[]>([])
const loaded = ref(false)

async function loadList() {
    try {
        const response = await sendGet("/organizations")
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
            <h2>Organizations</h2>

            <Table :rows="list.map(x => x.Name)" />

            <div class="padding-small">
                <Button @click="redirectOrganizationsNew">CREATE</Button>
            </div>
        </template>
    </Sidebar>
</template>