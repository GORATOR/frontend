<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../store/user.ts'
import Sidebar from '../../components/sidebar.vue'
import { BASE_URL } from '../../constants'

const store = useUserStore()
const loading = ref<boolean>(false)

async function createTeam() {
    loading.value = true

    const newTeam = {
        Name: "new name",
        Avatar: "new avatar"
    }

    try {
        const response = await fetch(
            BASE_URL + "/team",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
            FORM
            <span v-if="loading">WAIT...</span>
            <button v-else @click="createTeam">SUBMIT</button>
        </div>
    </Sidebar>
</template>