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
const organizationId = ref<string>("")
const loading = ref<boolean>(false)

const loaded = ref(false)
const offset = ref(0)
const options = ref(Array<SelectBoxOption>())
const hasMore = ref(true)
const isLoadingMore = ref(false)

async function loadList(reset = false) {
  if (reset) {
    offset.value = 0
    options.value = []
    hasMore.value = true
  }

  if (isLoadingMore.value) return

  isLoadingMore.value = true
  const data = await loadOrganizations(loaded, offset.value)
  
  if (data.length > 0) {
    const newOptions = data.map(el => (<SelectBoxOption>{
      value: el.ID.toString(), 
      label: el.Name
    }))
    
    if (reset) {
      options.value = newOptions
    } else {
      options.value = [...options.value, ...newOptions]
    }
    
    offset.value += data.length
    hasMore.value = data.length === 10 // Assume we have more if we got full batch
  } else {
    hasMore.value = false
  }
  
  isLoadingMore.value = false
}

async function loadMore() {
  await loadList(false)
}

async function create() {
    const team = <Team>{
        Name: name.value,
        Avatar: '',
        OrganizationIds: [parseInt(organizationId.value)]
    }
    return await createTeam(loading, team);
}

// Load initial data
loadList(true)
</script>

<template>
    <Sidebar :active=MenuItem.Teams>
        <h1>Create new Team</h1>
        <div>
            <SelectBox 
                :options="options" 
                :label="'Select organization'" 
                :loading="isLoadingMore"
                :hasMore="hasMore"
                @loadMore="loadMore"
                v-model="organizationId">
            </SelectBox>
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