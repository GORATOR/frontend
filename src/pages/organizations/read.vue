<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref, computed} from "vue";
import {Organization} from "../../models/organization.ts";
import {Team} from "../../models/team.ts";
import {User} from "../../models/user.ts";
import {EntityName} from "../../models/count.ts";
import {getEntityId, readEntity, generateEntityRecordUrl} from "../../service/readEntity.ts";
import {updateOrganization} from "../../service/updateEntity.ts";
import Button from "../../components/Button.vue";
import TextBox from "../../components/TextBox.vue";
import ImageUpload from "../../components/ImageUpload.vue";
import CollapsibleSection from "../../components/CollapsibleSection.vue";
import Table from "../../components/Table.vue";
import MultiSelectBox, { MultiSelectBoxElement } from "../../components/MultiSelectBox.vue";
import {SelectBoxOption} from "../../models/SelectBoxOption.ts";
import {DEFAULT_LIMIT} from "../../components/SelectBox.vue";
import {loadUsers, loadTeams} from "../../service/loadList.ts";

const loaded = ref(false);
const org = ref<Organization>({} as Organization);
let isEditing = ref<boolean>(false);
const loading = ref<boolean>(false);

// Related entities
const relatedTeams = ref<Team[]>([]);
const relatedUsers = ref<User[]>([]);

// MultiSelect for Users
const selectedUserIds = ref<string[]>([]);
const userOffset = ref(0);
const optionsUsers = ref<Array<SelectBoxOption>>([]);
const hasMoreUsers = ref(true);
const isLoadingUsers = ref(false);
const currentUserSearch = ref('');

// MultiSelect for Teams
const selectedTeamIds = ref<string[]>([]);
const teamOffset = ref(0);
const optionsTeams = ref<Array<SelectBoxOption>>([]);
const hasMoreTeams = ref(true);
const isLoadingTeams = ref(false);
const currentTeamSearch = ref('');

async function initLoad() {
  try {
    org.value = await readEntity(EntityName.Organization, getEntityId(EntityName.Organization))
    console.log('Loaded organization:', org.value);

    // Load related entities from nested objects
    loadRelatedEntities();

    loaded.value = true;
  } catch (e) {
    console.log(e);
  }
}

function loadRelatedEntities() {
  // Use preloaded nested entities from backend
  if (org.value.Teams && org.value.Teams.length > 0) {
    relatedTeams.value = org.value.Teams;
    selectedTeamIds.value = org.value.Teams.map(t => t.ID.toString());
    console.log('Loaded teams:', relatedTeams.value);
  }

  if (org.value.Users && org.value.Users.length > 0) {
    relatedUsers.value = org.value.Users;
    selectedUserIds.value = org.value.Users.map(u => u.ID.toString());
    console.log('Loaded users:', relatedUsers.value);
  }
}

function editSwitch() : void {
  isEditing.value = !isEditing.value;
  if (isEditing.value) {
    // Load data for MultiSelectBoxes when entering edit mode
    loadUsersData(true);
    loadTeamsData(true);
  }
}

function getButtonCaption(): string {
  return isEditing.value ? 'SAVE' : 'EDIT';
}

async function actionButtonClick(): Promise<void> {
  if (isEditing.value) {
    console.log('save action');
    // Update organization with selected IDs
    org.value.UserIds = selectedUserIds.value.map(id => parseInt(id));
    org.value.TeamIds = selectedTeamIds.value.map(id => parseInt(id));
    await updateOrganization(loading, org.value);
    console.log('edit disabled');
  } else {
    console.log('edit enabled');
  }
  editSwitch();
}

// Users MultiSelect functions
async function loadUsersData(reset = false, search = '') {
  if (reset) {
    userOffset.value = 0;
    optionsUsers.value = [];
    hasMoreUsers.value = true;
    currentUserSearch.value = search;
  }

  if (isLoadingUsers.value) return;

  isLoadingUsers.value = true;
  const dataUsers = await loadUsers(loaded, userOffset.value, DEFAULT_LIMIT, search);

  if (dataUsers.length > 0) {
    const newOptions = dataUsers.map(el => (<SelectBoxOption>{
      value: el.ID.toString(),
      label: el.Username
    }));

    if (reset) {
      optionsUsers.value = newOptions;
    } else {
      const existingValues = new Set(optionsUsers.value.map(opt => opt.value));
      const filteredNewOptions = newOptions.filter(opt => !existingValues.has(opt.value));
      optionsUsers.value = [...optionsUsers.value, ...filteredNewOptions];
    }

    userOffset.value += dataUsers.length;
    hasMoreUsers.value = dataUsers.length === DEFAULT_LIMIT;
  } else {
    hasMoreUsers.value = false;
  }

  isLoadingUsers.value = false;
}

async function loadMoreUsers() {
  await loadUsersData(false, currentUserSearch.value);
}

async function handleUserSearch(query: string) {
  await loadUsersData(true, query);
}

function onUserChanged(el: MultiSelectBoxElement) {
  selectedUserIds.value = el.values;
}

// Teams MultiSelect functions
async function loadTeamsData(reset = false, search = '') {
  if (reset) {
    teamOffset.value = 0;
    optionsTeams.value = [];
    hasMoreTeams.value = true;
    currentTeamSearch.value = search;
  }

  if (isLoadingTeams.value) return;

  isLoadingTeams.value = true;
  const dataTeams = await loadTeams(loaded, teamOffset.value, DEFAULT_LIMIT, search);

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

async function loadMoreTeams() {
  await loadTeamsData(false, currentTeamSearch.value);
}

async function handleTeamSearch(query: string) {
  await loadTeamsData(true, query);
}

function onTeamChanged(el: MultiSelectBoxElement) {
  selectedTeamIds.value = el.values;
}

const teamTableHeaders = ['ID', 'Name'];
const teamTableRows = computed(() =>
  relatedTeams.value.map(team => ({
    ID: team.ID,
    Name: team.Name,
    url: generateEntityRecordUrl(EntityName.Team, team.ID)
  }))
);

const userTableHeaders = ['ID', 'Username', 'Email'];
const userTableRows = computed(() =>
  relatedUsers.value.map(user => ({
    ID: user.ID,
    Username: user.Username,
    Email: user.Email,
    url: generateEntityRecordUrl(EntityName.User, user.ID)
  }))
);

initLoad();

</script>

<template>
  <Sidebar :active=MenuItem.Orgs>
    <template v-if="loaded">
      <h2>{{ org?.Name }}</h2>

      <div class="action-buttons">
        <Button @click="actionButtonClick">{{getButtonCaption()}}</Button>
      </div>

      <div class="organization-details">
        <!-- Organization Information -->
        <CollapsibleSection title="Organization Information" :defaultExpanded="true">
          <div class="detail-field">
            <label class="field-label">Organization Avatar:</label>
            <div class="field-value">
              <img v-if="!isEditing && org?.Avatar" :src="org.Avatar" alt="Organization Avatar" class="avatar-display" />
              <p v-if="!isEditing && !org?.Avatar" class="no-avatar">No avatar</p>
              <ImageUpload v-if="isEditing" label="" v-model="org.Avatar" :currentImage="org.Avatar" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Organization Name:</label>
            <div class="field-value">
              <p v-if="!isEditing">{{ org?.Name }}</p>
              <TextBox v-if="isEditing" label="" v-model="org.Name" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Organization ID:</label>
            <div class="field-value">
              <p>{{ org?.ID }}</p>
            </div>
          </div>

          <!-- MultiSelect for Users (Edit Mode) -->
          <div v-if="isEditing" class="detail-field">
            <label class="field-label">Users:</label>
            <div class="field-value">
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
            </div>
          </div>

          <!-- MultiSelect for Teams (Edit Mode) -->
          <div v-if="isEditing" class="detail-field">
            <label class="field-label">Teams:</label>
            <div class="field-value">
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
            </div>
          </div>
        </CollapsibleSection>

        <!-- Related Teams -->
        <CollapsibleSection
          v-if="relatedTeams.length > 0"
          title="Teams"
          :defaultExpanded="false">
          <Table
            :headers="teamTableHeaders"
            :rows="teamTableRows"
          />
        </CollapsibleSection>

        <!-- Related Users -->
        <CollapsibleSection
          v-if="relatedUsers.length > 0"
          title="Users"
          :defaultExpanded="false">
          <Table
            :headers="userTableHeaders"
            :rows="userTableRows"
          />
        </CollapsibleSection>
      </div>
    </template>

  </Sidebar>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as *;

.action-buttons {
  margin: 20px 0;
}

.organization-details {
  margin-top: 20px;

  .detail-field {
    display: flex;
    margin-bottom: 15px;
    align-items: flex-start;

    &:last-child {
      margin-bottom: 0;
    }

    .field-label {
      font-weight: 600;
      min-width: 180px;
      padding-top: 8px;
      color: #333;
    }

    .field-value {
      flex: 1;

      p {
        margin: 0;
        padding: 8px 0;
        color: #666;
      }

      .avatar-display {
        max-width: 200px;
        max-height: 200px;
        border-radius: 8px;
        border: 1px solid $main_theme_background_lighter1;
        object-fit: contain;
      }

      .no-avatar {
        color: #999;
        font-style: italic;
      }
    }
  }

  .loading-message {
    color: #999;
    font-style: italic;
    margin: 10px 0;
  }
}
</style>