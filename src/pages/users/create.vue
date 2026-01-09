<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import TextBox from '../../components/TextBox.vue'
import Button from '../../components/Button.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import {createUser} from "../../service/createEntity.ts";
import {UserCreate} from "../../models/user.ts";
import {loadOrganizations, loadTeams, loadRoles} from "../../service/loadList.ts";
import {SelectBoxOption} from "../../models/SelectBoxOption.ts";
import MultiSelectBox, { DEFAULT_LIMIT, MultiSelectBoxElement } from "../../components/MultiSelectBox.vue";

const loading = ref<boolean>(false)
const orgOffset = ref(0);
const teamOffset = ref(0);
const roleOffset = ref(0);
const selectedTeamIds = ref<string[]>([]);
const selectedOrgIds = ref<string[]>([]);
const selectedRoleIds = ref<string[]>([]);
const user = ref<UserCreate>({
  Username: '',
  Email: '',
  Password: '',
  TeamIds: [],
  OrganizationIds: [],
  RoleIds: [],
});

const optionsTeams = ref<Array<SelectBoxOption>>([]);
const optionsOrgs = ref<Array<SelectBoxOption>>([]);
const optionsRoles = ref<Array<SelectBoxOption>>([]);
const hasMoreTeams = ref(true);
const hasMoreOrgs = ref(true);
const hasMoreRoles = ref(true);
const isLoadingTeams = ref(false);
const isLoadingOrgs = ref(false);
const isLoadingRoles = ref(false);
const currentTeamSearch = ref('');
const currentOrgSearch = ref('');
const currentRoleSearch = ref('');

async function create() {
    console.log('create clicked');
    console.log('User data:', JSON.stringify(user.value, null, 2));
    return await createUser(loading, user.value);
}

async function loadOrgs(reset = false, search = '') {
  if (reset) {
    orgOffset.value = 0;
    optionsOrgs.value = [];
    hasMoreOrgs.value = true;
    currentOrgSearch.value = search;
  }

  if (isLoadingOrgs.value) return;

  isLoadingOrgs.value = true;
  const dataOrgs = await loadOrganizations(loading, orgOffset.value, DEFAULT_LIMIT, search);
  
  if (dataOrgs.length > 0) {
    const newOptions = dataOrgs.map(el => (<SelectBoxOption>{
      value: el.ID.toString(), 
      label: el.Name
    }));
    
    if (reset) {
      optionsOrgs.value = newOptions;
    } else {
      const existingValues = new Set(optionsOrgs.value.map(opt => opt.value));
      const filteredNewOptions = newOptions.filter(opt => !existingValues.has(opt.value));
      optionsOrgs.value = [...optionsOrgs.value, ...filteredNewOptions];
    }
    
    orgOffset.value += dataOrgs.length;
    hasMoreOrgs.value = dataOrgs.length === DEFAULT_LIMIT;
  } else {
    hasMoreOrgs.value = false;
  }
  
  isLoadingOrgs.value = false;
}

async function loadTeamsData(reset = false, search = '') {
  if (reset) {
    teamOffset.value = 0;
    optionsTeams.value = [];
    hasMoreTeams.value = true;
    currentTeamSearch.value = search;
  }

  if (isLoadingTeams.value) return;

  isLoadingTeams.value = true;
  const dataTeams = await loadTeams(loading, teamOffset.value, DEFAULT_LIMIT, search);
  
  if (dataTeams.length > 0) {
    const newOptions = dataTeams.map(el => (<SelectBoxOption>{
      value: el.ID.toString(), 
      label: el.Name
    }));
    
    if (reset) {
      optionsTeams.value = newOptions;
    } else {
      const existingValues = new Set(optionsTeams.value.map(opt => opt.value));
      const filteredNewOptions = newOptions.filter(opt => !existingValues.has(opt.value));
      optionsTeams.value = [...optionsTeams.value, ...filteredNewOptions];
    }
    
    teamOffset.value += dataTeams.length;
    hasMoreTeams.value = dataTeams.length === DEFAULT_LIMIT;
  } else {
    hasMoreTeams.value = false;
  }
  
  isLoadingTeams.value = false;
}

async function loadMoreOrgs() {
  await loadOrgs(false, currentOrgSearch.value);
}

async function loadMoreTeams() {
  await loadTeamsData(false, currentTeamSearch.value);
}

async function handleOrgSearch(query: string) {
  await loadOrgs(true, query);
}

async function handleTeamSearch(query: string) {
  await loadTeamsData(true, query);
}

function onOrgChanged(el: MultiSelectBoxElement) {
  selectedOrgIds.value = el.values;
  user.value.OrganizationIds = el.values.map(v => parseInt(v));
}

function onTeamChanged(el: MultiSelectBoxElement) {
  selectedTeamIds.value = el.values;
  user.value.TeamIds = el.values.map(v => parseInt(v));
}

async function loadRolesData(reset = false, search = '') {
  if (reset) {
    roleOffset.value = 0;
    optionsRoles.value = [];
    hasMoreRoles.value = true;
    currentRoleSearch.value = search;
  }

  if (isLoadingRoles.value) return;

  isLoadingRoles.value = true;
  const dataRoles = await loadRoles(loading, roleOffset.value, DEFAULT_LIMIT, search);

  if (dataRoles.length > 0) {
    const newOptions = dataRoles.map(el => (<SelectBoxOption>{
      value: el.ID.toString(),
      label: el.Name
    }));

    if (reset) {
      optionsRoles.value = newOptions;
    } else {
      const existingValues = new Set(optionsRoles.value.map(opt => opt.value));
      const filteredNewOptions = newOptions.filter(opt => !existingValues.has(opt.value));
      optionsRoles.value = [...optionsRoles.value, ...filteredNewOptions];
    }

    roleOffset.value += dataRoles.length;
    hasMoreRoles.value = dataRoles.length === DEFAULT_LIMIT;
  } else {
    hasMoreRoles.value = false;
  }

  isLoadingRoles.value = false;
}

async function loadMoreRoles() {
  await loadRolesData(false, currentRoleSearch.value);
}

async function handleRoleSearch(query: string) {
  await loadRolesData(true, query);
}

function onRoleChanged(el: MultiSelectBoxElement) {
  selectedRoleIds.value = el.values;
  user.value.RoleIds = el.values.map(v => parseInt(v));
}

const isFormValid = computed(() => {
  return user.value.Username.trim() !== '' &&
         user.value.Email.trim() !== '' &&
         user.value.Password.trim() !== '' &&
         user.value.OrganizationIds.length > 0 &&
         user.value.TeamIds.length > 0;
});

// Load initial data
loadOrgs(true);
loadTeamsData(true);
loadRolesData(true);
</script>

<template>
    <Sidebar :active=MenuItem.Users>
        <h1>Create new User</h1>
        <div>
            <TextBox label="Name" v-model="user.Username" />
            <TextBox label="Email" v-model="user.Email" />
            <TextBox label="Password" v-model="user.Password" />
            
            <MultiSelectBox
                :options="optionsOrgs"
                :label="'Select organizations'"
                :loading="isLoadingOrgs"
                :hasMore="hasMoreOrgs"
                @loadMore="loadMoreOrgs"
                @search="handleOrgSearch"
                @changed="onOrgChanged"
                v-model="selectedOrgIds"
            />
            
            <MultiSelectBox
                :options="optionsTeams"
                :label="'Select teams'"
                :loading="isLoadingTeams"
                :hasMore="hasMoreTeams"
                @loadMore="loadMoreTeams"
                @search="handleTeamSearch"
                @changed="onTeamChanged"
                v-model="selectedTeamIds"
            />

            <MultiSelectBox
                :options="optionsRoles"
                :label="'Select roles'"
                :loading="isLoadingRoles"
                :hasMore="hasMoreRoles"
                @loadMore="loadMoreRoles"
                @search="handleRoleSearch"
                @changed="onRoleChanged"
                v-model="selectedRoleIds"
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
.chip-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  .chip-el {
    margin-left: 8px;
    border-radius: 5px;
    height: 32px;
    padding-left: 4px;
    padding-right: 4px;
  }
}
</style>