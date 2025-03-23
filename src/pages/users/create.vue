<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import TextBox from '../../components/TextBox.vue'
import Button from '../../components/Button.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import {createUser} from "../../service/createEntity.ts";
import {User} from "../../models/user.ts";

const name = ref<string>("")
const email = ref<string>("")
const loading = ref<boolean>(false)

async function create() {
    const user = <User>{
        Username: name.value,
        Email: email.value
    }
    return await createUser(loading, user)
}
</script>

<template>
    <Sidebar :active=MenuItem.Users>
        <h1>Create new User</h1>
        <div>
            <TextBox label="Name" v-model="name" />
            <TextBox label="Email" v-model="email" />
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