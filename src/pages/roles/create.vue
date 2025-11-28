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
        <h1>Create new Role</h1>
        <div>
            <TextBox label="Name" v-model="name" />
            <h3>Permissions</h3>
            <RulesTable v-model="rules" />
            <div class="padding-small">
                <Button v-if="loading" disabled>SUBMIT</Button>
                <Button v-else @click="create">SUBMIT</Button>
            </div>
        </div>
    </Sidebar>
</template>

<style scoped lang="scss">
h3 {
    margin-top: 20px;
    margin-bottom: 10px;
}

.padding-small {
    padding-top: 14px;
}
</style>
