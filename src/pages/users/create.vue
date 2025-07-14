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
import SelectBox from "../../components/SelectBox.vue";
import RemovableChip from "../../components/RemovableChip.vue";

const loading = ref<boolean>(false)
const orgOffset = ref(0);
const teamOffset = ref(0);
const teamId = ref(0);
const orgId = ref(0);
const user = ref<UserCreate>({
  Username: '',
  Email: '',
  Password: '',
  TeamIds: [],
  OrganizationIds: [],
});

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

function addIdOnlyIfNew(id: number | undefined, data: Array<number>) : void {
  if (id === undefined || id <= 0) {
    return;
  }
  for (let i of data) {
    if(i == id) {
      return;
    }
  }
  data.push(id);
}

function removeFromArrByValue(data: Array<number>, value: number) : Array<number> {
  return data.filter(el => el !== value);
}

function onOrgChanged(id: number|undefined) : void {
  addIdOnlyIfNew(id, user.value.OrganizationIds);
  orgId.value = 0;
}

function onTeamChanged(id: number|undefined) : void {
  addIdOnlyIfNew(id, user.value.TeamIds);
  teamId.value = 0;
}

function removeOrg(value: string) : void {
  user.value.OrganizationIds = removeFromArrByValue(user.value.OrganizationIds, Number.parseInt(value));
}

function removeTeam(value: string) : void {
  user.value.TeamIds = removeFromArrByValue(user.value.TeamIds, Number.parseInt(value));
}

loadLists();
</script>

<template>
    <Sidebar :active=MenuItem.Users>
        <h1>Create new User</h1>
        <div v-if="user.OrganizationIds.length > 0" class="organizations">
          <label>Organizations:</label>
          <div v-for="org in user.OrganizationIds">
            <removable-chip :text="org.toString()" :payload="org.toString()" :chip-class="``" @onClose="removeOrg" />
          </div>
        </div>
        <div v-if="user.TeamIds.length > 0" class="teams">
          <label>Teams:</label>
          <div v-for="team in user.TeamIds">
            <removable-chip :text="team.toString()" :payload="team.toString()" :chip-class="``" @onClose="removeTeam" />
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
</style>