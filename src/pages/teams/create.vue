<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import TextBox from '../../components/TextBox.vue'
import Button from '../../components/Button.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import {SelectBoxOption} from "../../models/SelectBoxOption.ts";
import SelectBox, {DEFAULT_LIMIT} from "../../components/SelectBox.vue";
import MultiSelectBox, { MultiSelectBoxElement } from "../../components/MultiSelectBox.vue";
import ImageUpload from "../../components/ImageUpload.vue";
import {Team} from "../../models/team.ts";
import {createTeam} from "../../service/createEntity.ts";
import {loadOrganizations, loadUsers, loadProjects} from "../../service/loadList.ts";

const name = ref<string>("")
const organizationId = ref<string>("")
const avatar = ref<string>("")
const selectedUserIds = ref<string[]>([])
const selectedProjectIds = ref<string[]>([])
const loading = ref<boolean>(false)

// Organizations
const loaded = ref(false)
const offset = ref(0)
const options = ref(Array<SelectBoxOption>())
const hasMore = ref(true)
const isLoadingMore = ref(false)
const currentSearchQuery = ref('')

// Users
const userOffset = ref(0)
const optionsUsers = ref<Array<SelectBoxOption>>([])
const hasMoreUsers = ref(true)
const isLoadingUsers = ref(false)
const currentUserSearch = ref('')

// Projects
const projectOffset = ref(0)
const optionsProjects = ref<Array<SelectBoxOption>>([])
const hasMoreProjects = ref(true)
const isLoadingProjects = ref(false)
const currentProjectSearch = ref('')

async function loadList(reset = false, search = '') {
  if (reset) {
    offset.value = 0
    options.value = []
    hasMore.value = true
    currentSearchQuery.value = search
  }

  if (isLoadingMore.value) {
    return
  }

  isLoadingMore.value = true
  const data = await loadOrganizations(loaded, offset.value, DEFAULT_LIMIT, search)
  
  if (data.length > 0) {
    const newOptions = data.map(el => (<SelectBoxOption>{
      value: el.ID.toString(), 
      label: el.Name
    }))
    
    if (reset) {
      options.value = newOptions
    } else {
      const existingValues = new Set(options.value.map(opt => opt.value))
      const filteredNewOptions = newOptions.filter(opt => !existingValues.has(opt.value))
      options.value = [...options.value, ...filteredNewOptions]
    }
    
    offset.value += data.length
    hasMore.value = data.length === DEFAULT_LIMIT;
  } else {
    hasMore.value = false
  }
  
  isLoadingMore.value = false
}

async function loadMore() {
  await loadList(false, currentSearchQuery.value)
}

async function handleSearch(query: string) {
  await loadList(true, query)
}

async function loadUsersData(reset = false, search = '') {
  if (reset) {
    userOffset.value = 0
    optionsUsers.value = []
    hasMoreUsers.value = true
    currentUserSearch.value = search
  }

  if (isLoadingUsers.value) return

  isLoadingUsers.value = true
  const dataUsers = await loadUsers(loaded, userOffset.value, DEFAULT_LIMIT, search)

  if (dataUsers.length > 0) {
    const newOptions = dataUsers.map(el => (<SelectBoxOption>{
      value: el.ID.toString(),
      label: el.Username
    }))

    if (reset) {
      optionsUsers.value = newOptions
    } else {
      const existingValues = new Set(optionsUsers.value.map(opt => opt.value))
      const filteredNewOptions = newOptions.filter(opt => !existingValues.has(opt.value))
      optionsUsers.value = [...optionsUsers.value, ...filteredNewOptions]
    }

    userOffset.value += dataUsers.length
    hasMoreUsers.value = dataUsers.length === DEFAULT_LIMIT
  } else {
    hasMoreUsers.value = false
  }

  isLoadingUsers.value = false
}

async function loadProjectsData(reset = false, search = '') {
  if (reset) {
    projectOffset.value = 0
    optionsProjects.value = []
    hasMoreProjects.value = true
    currentProjectSearch.value = search
  }

  if (isLoadingProjects.value) return

  isLoadingProjects.value = true
  const dataProjects = await loadProjects(loaded, projectOffset.value, DEFAULT_LIMIT, search)

  if (dataProjects.length > 0) {
    const newOptions = dataProjects.map(el => (<SelectBoxOption>{
      value: el.ID.toString(),
      label: el.Name
    }))

    if (reset) {
      optionsProjects.value = newOptions
    } else {
      const existingValues = new Set(optionsProjects.value.map(opt => opt.value))
      const filteredNewOptions = newOptions.filter(opt => !existingValues.has(opt.value))
      optionsProjects.value = [...optionsProjects.value, ...filteredNewOptions]
    }

    projectOffset.value += dataProjects.length
    hasMoreProjects.value = dataProjects.length === DEFAULT_LIMIT
  } else {
    hasMoreProjects.value = false
  }

  isLoadingProjects.value = false
}

async function loadMoreUsers() {
  await loadUsersData(false, currentUserSearch.value)
}

async function loadMoreProjects() {
  await loadProjectsData(false, currentProjectSearch.value)
}

async function handleUserSearch(query: string) {
  await loadUsersData(true, query)
}

async function handleProjectSearch(query: string) {
  await loadProjectsData(true, query)
}

function onUserChanged(el: MultiSelectBoxElement) {
  selectedUserIds.value = el.values
}

function onProjectChanged(el: MultiSelectBoxElement) {
  selectedProjectIds.value = el.values
}

const isFormValid = computed(() => {
  return name.value.trim() !== '' &&
         organizationId.value.trim() !== ''
})

async function create() {
    const team = <Team>{
        Name: name.value,
        Avatar: avatar.value,
        OrganizationIds: [parseInt(organizationId.value)],
        UserIds: selectedUserIds.value.map(id => parseInt(id)),
        ProjectIds: selectedProjectIds.value.map(id => parseInt(id))
    }
    return await createTeam(loading, team);
}

// Load initial data
loadList(true)
loadUsersData(true)
loadProjectsData(true)
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
                @search="handleSearch"
                v-model="organizationId">
            </SelectBox>

            <TextBox label="Name" v-model="name" />

            <ImageUpload
                label="Team Avatar"
                v-model="avatar"
            />

            <MultiSelectBox
                :options="optionsUsers"
                :label="'Select users'"
                :loading="isLoadingUsers"
                :hasMore="hasMoreUsers"
                @loadMore="loadMoreUsers"
                @search="handleUserSearch"
                @changed="onUserChanged"
                v-model="selectedUserIds"
            />

            <MultiSelectBox
                :options="optionsProjects"
                :label="'Select projects'"
                :loading="isLoadingProjects"
                :hasMore="hasMoreProjects"
                @loadMore="loadMoreProjects"
                @search="handleProjectSearch"
                @changed="onProjectChanged"
                v-model="selectedProjectIds"
            />

            <div class="padding-small">
                <Button v-if="!isFormValid" disabled>SUBMIT</Button>
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