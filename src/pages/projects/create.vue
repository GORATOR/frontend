<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import { sendPost } from '../../utils/requests'
import { redirectProjectsList } from '../../utils/redirects'
import TextBox from '../../components/TextBox.vue'
import Button from '../../components/Button.vue'

const name = ref<string>("")
const loading = ref<boolean>(false)

async function create() {
    loading.value = true

    const newEntity = {
        Name: name.value,
        TeamId: 1 // for test
    }

    try {
        const response = await sendPost("/project", newEntity)

        if (response.status != 200) {
            console.error('Invalid response:', response)
            return false
        }

        redirectProjectsList()
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
        <h1>Create new Project</h1>
        <div>
            <TextBox label="Name" v-model="name" />
            <div class="padding-small">
                <Button v-if="loading" disabled>SUBMIT</Button>
                <Button v-else @click="create">SUBMIT</Button>
            </div>
        </div>
    </Sidebar>
</template>

<style scoped lang="scss">
.padding-small {
    padding-top: 14px;
}
</style>