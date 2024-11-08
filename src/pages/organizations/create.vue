<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/sidebar.vue'
import { sendPost } from '../../utils/requests'
import { redirectOrganizationsList } from '../../utils/redirects'
import TextBox from '../../components/textbox.vue'

const name = ref<string>("")
const loading = ref<boolean>(false)

async function create() {
    loading.value = true

    const newEntity = {
        Name: name.value,
        Avatar: "",
        Active: true
    }

    try {
        const response = await sendPost("/organization", newEntity)

        if (response.status != 200) {
            console.error('Invalid response:', response)
            return false
        }

        redirectOrganizationsList()
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
        <h1>Create new Organization</h1>
        <div>
            <TextBox label="Name" v-model="name" />
            <span v-if="loading">WAIT...</span>
            <button v-else @click="create">SUBMIT</button>
        </div>
    </Sidebar>
</template>