<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import TextBox from '../../components/TextBox.vue'
import Button from '../../components/Button.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import {createOrganization} from "../../service/createEntity.ts";
import {Organization} from "../../models/organization.ts";

const name = ref<string>("")
const loading = ref<boolean>(false)

async function create() {
    return await createOrganization(loading, <Organization>{ Name: name.value})
}
</script>

<template>
    <Sidebar :active=MenuItem.Orgs>
        <h1>Create new Organization</h1>
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