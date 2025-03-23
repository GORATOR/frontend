<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import TextBox from '../../components/TextBox.vue'
import Button from '../../components/Button.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import {SelectBoxOption} from "../../models/SelectBoxOption.ts";
import SelectBox from "../../components/SelectBox.vue";
import {Team} from "../../models/team.ts";
import {createTeam} from "../../service/createEntity.ts";
import {loadOrganizations} from "../../service/loadList.ts";

const name = ref<string>("")
const organizationId = ref<number>()
const loading = ref<boolean>(false)

const loaded = ref(false)
//const page = ref(1)
const offset = ref(0)
const options = ref(Array<SelectBoxOption>())

async function loadList() {
  const data = await loadOrganizations(loaded, offset.value);
  if (data.length > 0) {
    //@ts-ignore
    options.value = data.map(el => (<SelectBoxOption>{value: el.ID, label: el.Name}))
  }
}

async function create() {
    const team = <Team>{
        Name: name.value,
        Avatar: '',
        OrganizationIds: [organizationId.value]
    }
    return await createTeam(loading, team);
}

loadList()
</script>

<template>
    <Sidebar :active=MenuItem.Teams>
        <h1>Create new Team</h1>
        <div>
            <SelectBox :options="options" :label="'Select organization'" v-model="organizationId"></SelectBox>
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