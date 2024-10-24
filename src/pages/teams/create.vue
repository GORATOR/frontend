<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../store/user.ts'
import Sidebar from '../../components/sidebar.vue'
import { BASE_URL } from '../../constants'

const store = useUserStore()
const teamName = ref<string>("")
const loading = ref<boolean>(false)

async function createTeam() {
    loading.value = true

    const newTeam = {
        Name: teamName.value,
        Avatar: ""
    }

    try {
        const response = await fetch(
            BASE_URL + "/team",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Id': `${store.sessionId}`
                },
                body: JSON.stringify(newTeam),
            })

        if (response.status != 200) {
            console.error('Invalid response:', response)
            return false
        }

        return true
    }
    catch (err) {
        console.error('Error:', err)
    }
    finally {
        loading.value = false
    }

    return false
}
</script>

<template>
    <Sidebar>
        <h1>Create new Team</h1>
        <div>
            <input type="text" v-model="teamName" />
            <span v-if="loading">WAIT...</span>
            <button v-else @click="createTeam">SUBMIT</button>
        </div>
    </Sidebar>
</template>