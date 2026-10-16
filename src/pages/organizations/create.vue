<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import TextBox from '../../components/TextBox.vue'
import Button from '../../components/Button.vue'
import ImageUpload from '../../components/ImageUpload.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import {createOrganization} from "../../service/createEntity.ts";
import {Organization} from "../../models/organization.ts";

const name = ref<string>("")
const avatar = ref<string>("")
const loading = ref<boolean>(false)

async function create() {
    return await createOrganization(loading, <Organization>{ Name: name.value, Avatar: avatar.value})
}
</script>

<template>
    <Sidebar :active=MenuItem.Orgs>
        <h2>Create new Organization</h2>
        <div class="create-form">
            <TextBox label="Name" v-model="name" />
            <ImageUpload label="Avatar" v-model="avatar" />
            <div class="form-actions">
                <Button v-if="loading" disabled>SUBMIT</Button>
                <Button v-else @click="create">SUBMIT</Button>
            </div>
        </div>
    </Sidebar>
</template>

<style scoped lang="scss">
h2 {
    margin: 0 0 20px;
    font-size: 22px;
}

.create-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 600px;
}

.form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}
</style>