<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import TextBox from '../../components/TextBox.vue'
import Button from '../../components/Button.vue'
import RulesTable from '../../components/RulesTable.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import { createRole } from "../../service/createEntity.ts"
import type { Role, Rule } from "../../models/role.ts"

const name = ref<string>("")
const rules = ref<Rule[]>([])
const loading = ref<boolean>(false)

async function create() {
    return await createRole(loading, { Name: name.value, Rules: rules.value } as Role)
}
</script>

<template>
    <Sidebar :active=MenuItem.Roles>
        <h2>Create new Role</h2>
        <div class="create-form">
            <TextBox label="Name" v-model="name" />
            <h3>Permissions</h3>
            <RulesTable v-model="rules" />
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

    h3 {
        margin: 8px 0 0;
        font-size: 15px;
    }
}

.form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}
</style>
