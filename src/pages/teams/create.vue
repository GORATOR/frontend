<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import {sendGet, sendPost} from '../../utils/requests'
import { redirectTeamsList } from '../../utils/redirects'
import TextBox from '../../components/TextBox.vue'
import Button from '../../components/Button.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import {SelectBoxOption} from "../../models/SelectBoxOption.ts";
import SelectBox from "../../components/SelectBox.vue";
import {Team} from "../../models/team.ts";

const name = ref<string>("")
const organizationId = ref<number>()
const loading = ref<boolean>(false)

const loaded = ref(false)
//const page = ref(1)
const offset = ref(0)
const options = ref(Array<SelectBoxOption>())

async function loadList() {
  loaded.value = false
  try {
    const response = await sendGet("/organizations?limit=10&offset=" + offset.value)
    if (response.status == 200) {
      const data = await response.json()
      if (data.length > 0) {
        //@ts-ignore
        options.value = data.map(el=> ({value: el.ID, label: el.Name}))
      }
      loaded.value = true
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

async function create() {
    loading.value = true

    const newEntity = <Team>{
        Name: name.value,
        Avatar: '',
        OrganizationIds: [organizationId.value]
    }

    try {
        const response = await sendPost("/team", newEntity)

        if (response.status != 200) {
            console.error('Invalid response:', response)
            return false
        }

        redirectTeamsList()
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