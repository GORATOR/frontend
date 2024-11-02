<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/sidebar.vue'
import { sendPost } from '../../utils/requests'

const teamName = ref<string>("")
const loading = ref<boolean>(false)

async function createTeam() {
    loading.value = true

    const newTeam = {
        Name: teamName.value,
        Avatar: ""
    }

    try {
        const response = await sendPost("/team", newTeam)

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