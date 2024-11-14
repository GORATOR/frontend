<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/sidebar.vue'
import { sendPost } from '../../utils/requests'
import { redirectUsersList } from '../../utils/redirects'
import TextBox from '../../components/textbox.vue'
import Button from '../../components/button.vue'

const name = ref<string>("")
const email = ref<string>("")
const loading = ref<boolean>(false)

async function create() {
    loading.value = true

    const newEntity = {
        Username: name.value,
        Email: email.value,
        Avatar: "",
        Active: true
    }

    try {
        const response = await sendPost("/user", newEntity)

        if (response.status != 200) {
            console.error('Invalid response:', response)
            return false
        }

        redirectUsersList()
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
        <h1>Create new User</h1>
        <div>
            <TextBox label="Name" v-model="name" />
            <TextBox label="Email" v-model="email" />
            <Button v-if="loading" disabled>SUBMIT</Button>
            <Button v-else @click="create">SUBMIT</Button>
        </div>
    </Sidebar>
</template>