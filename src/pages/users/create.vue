<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import TextBox from '../../components/TextBox.vue'
import Button from '../../components/Button.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import {createUser} from "../../service/createEntity.ts";
import {UserCreate} from "../../models/user.ts";
import {loadOrganizations, loadTeams} from "../../service/loadList.ts";
import {SelectBoxOption} from "../../models/SelectBoxOption.ts";
import SelectBox, {SelectBoxElement} from "../../components/SelectBox.vue";
import RemovableChip from "../../components/RemovableChip.vue";

const loading = ref<boolean>(false)
const orgOffset = ref(0);
const teamOffset = ref(0);
const teamId = ref('');
const orgId = ref('');
const user = ref<UserCreate>({
  Username: '',
  Email: '',
  Password: '',
  TeamIds: [],
  OrganizationIds: [],
});
const selectedTeams = ref<Array<SelectBoxElement>>([]);
const selectedOrgs = ref<Array<SelectBoxElement>>([]);

const optionsTeams = ref(Array<SelectBoxOption>());
const optionsOrgs = ref(Array<SelectBoxOption>());

async function create() {
    console.log('create clicked');
    return await createUser(loading, user.value);
}

async function loadLists() {
  const dataOrgs = await loadOrganizations(loading, orgOffset.value);
  if (dataOrgs.length > 0) {
    //@ts-ignore
    optionsOrgs.value = dataOrgs.map(el => (<SelectBoxOption>{value: el.ID, label: el.Name}))
  }
  const dataTeams = await loadTeams(loading, teamOffset.value);
  if (dataTeams.length > 0) {
    //@ts-ignore
    optionsTeams.value = dataTeams.map(el => (<SelectBoxOption>{value: el.ID, label: el.Name}))
  }
  loading.value = false;
}

function addIdOnlyIfNew(el: SelectBoxElement, data: Array<number>, selectedData: Array<SelectBoxElement>) : void {
  if (el.value === undefined) {
    return;
  }
  const id = Number.parseInt(el.value);
  if (id <= 0) {
    return;
  }
  for (let i of data) {
    if(i == id) {
      return;
    }
  }
  data.push(id);
  selectedData.push(el);
}

function removeFromArrByValue(data: Array<number>, value: number) : Array<number> {
  return data.filter(el => el !== value);
}

function onOrgChanged(el: SelectBoxElement) : void {
  if (el.value === undefined) {
    return;
  }
  addIdOnlyIfNew(el, user.value.OrganizationIds, selectedOrgs.value);
  orgId.value = '';
}

function onTeamChanged(el: SelectBoxElement) : void {
  if (el.value === undefined) {
    return;
  }
  addIdOnlyIfNew(el, user.value.TeamIds, selectedTeams.value);
  teamId.value = '';
}

function removeOrg(value: string) : void {
  selectedOrgs.value = selectedOrgs.value.filter(el => el.value !== value);
  user.value.OrganizationIds = removeFromArrByValue(user.value.OrganizationIds, Number.parseInt(value));
}

function removeTeam(value: string) : void {
  selectedTeams.value = selectedTeams.value.filter(el => el.value !== value);
  user.value.TeamIds = removeFromArrByValue(user.value.TeamIds, Number.parseInt(value));
}

loadLists();
</script>

<template>
    <Sidebar :active=MenuItem.Users>
        <h1>Create new User</h1>
        <div v-if="selectedOrgs.length > 0" class="organizations">
          <label>Organizations:</label>
          <div class="chip-group org-chip-group">
            <removable-chip v-for="org in selectedOrgs"
                :text="org.name"
                :payload="org.value"
                :chip-class="`chip-el`" @onClose="removeOrg" />
          </div>
        </div>
        <div v-if="selectedTeams.length > 0" class="teams">
          <label>Teams:</label>
          <div class="chip-group team-chip-group">
            <removable-chip v-for="team in selectedTeams"
                :text="team.name"
                :payload="team.value"
                :chip-class="`chip-el`" @onClose="removeTeam" />
          </div>
        </div>
        <div>
            <TextBox label="Name" v-model="user.Username" />
            <TextBox label="Email" v-model="user.Email" />
            <TextBox label="Password" v-model="user.Password" />
            <SelectBox
                :options="optionsOrgs"
                :label="'Select organization'"
                v-model="orgId"
                @changed="onOrgChanged"
            ></SelectBox>
            <SelectBox
                :options="optionsTeams"
                :label="'Select team'"
                v-model="teamId"
                @changed="onTeamChanged"
            ></SelectBox>
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