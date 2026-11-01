<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref, computed} from "vue";
import {Organization} from "../../models/organization.ts";
import {Team} from "../../models/team.ts";
import {User} from "../../models/user.ts";
import {EntityName} from "../../models/count.ts";
import {getEntityId, readEntity, generateEntityRecordUrl} from "../../service/readEntity.ts";
import {useEntityEditor} from "../../utils/useEntityEditor.ts";
import Button from "../../components/Button.vue";
import TextBox from "../../components/TextBox.vue";
import ImageUpload from "../../components/ImageUpload.vue";
import CollapsibleSection from "../../components/CollapsibleSection.vue";
import Table from "../../components/Table.vue";
import MultiSelectBox, { MultiSelectBoxElement } from "../../components/MultiSelectBox.vue";
import {loadUsers, loadTeams} from "../../service/loadList.ts";
import {useEntityLoader} from "../../utils/useEntityLoader.ts";

const loaded = ref(false);
const org = ref<Organization>({} as Organization);

// Related entities
const relatedTeams = ref<Team[]>([]);
const relatedUsers = ref<User[]>([]);

// Selected IDs for editing
const selectedUserIds = ref<string[]>([]);
const selectedTeamIds = ref<string[]>([]);

// Initialize entity loaders using composable
const usersLoader = useEntityLoader({
  loadFunction: loadUsers,
  mapToOption: (user) => ({
    value: user.ID.toString(),
    label: user.Username
  })
});

const teamsLoader = useEntityLoader({
  loadFunction: loadTeams,
  mapToOption: (team) => ({
    value: team.ID.toString(),
    label: team.Name
  })
});

// Initialize entity editor composable
const editor = useEntityEditor({
  entity: org,
  entityType: 'organization',
  onEditStart: () => {
    usersLoader.loadData(true);
    teamsLoader.loadData(true);
  },
  onSaveSuccess: async () => {
    await initLoad();
  },
  prepareUpdateData: (org) => {
    return {
      ...org,
      UserIds: selectedUserIds.value.map(id => parseInt(id)),
      TeamIds: selectedTeamIds.value.map(id => parseInt(id))
    };
  },
  additionalStateToSave: () => ({
    selectedUserIds: [...selectedUserIds.value],
    selectedTeamIds: [...selectedTeamIds.value]
  }),
  restoreAdditionalState: (state) => {
    selectedUserIds.value = state.selectedUserIds || [];
    selectedTeamIds.value = state.selectedTeamIds || [];
  }
});

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

async function actionButtonClick(): Promise<void> {
  await editor.handleActionButton();
}

// Change handlers for MultiSelectBox
function onUserChanged(el: MultiSelectBoxElement) {
  selectedUserIds.value = el.values;
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
        <Button @click="actionButtonClick">{{editor.getButtonCaption()}}</Button>
        <Button v-if="editor.isEditing.value" variant="secondary" @click="editor.cancelEdit">CANCEL</Button>
      </div>

      <div v-if="editor.saveError.value" class="error-banner">
        {{ editor.saveError.value }}
      </div>

      <div class="organization-details">
        <!-- Organization Information -->
        <CollapsibleSection title="Organization Information" :defaultExpanded="true">
          <div class="detail-field">
            <label class="field-label">Organization Avatar:</label>
            <div class="field-value">
              <img v-if="!editor.isEditing.value && org?.Avatar" :src="org.Avatar" alt="Organization Avatar" class="avatar-display" />
              <p v-if="!editor.isEditing.value && !org?.Avatar" class="no-avatar">No avatar</p>
              <ImageUpload v-if="editor.isEditing.value" label="" v-model="org.Avatar" :currentImage="org.Avatar" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Organization Name:</label>
            <div class="field-value">
              <p v-if="!editor.isEditing.value">{{ org?.Name }}</p>
              <TextBox v-if="editor.isEditing.value" label="" v-model="org.Name" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Organization ID:</label>
            <div class="field-value">
              <p class="mono-value">{{ org?.ID }}</p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Related Teams -->
        <CollapsibleSection
          v-if="!editor.isEditing.value && relatedTeams.length > 0"
          title="Teams"
          :defaultExpanded="false">
          <Table
            :headers="teamTableHeaders"
            :rows="teamTableRows"
          />
        </CollapsibleSection>

        <!-- Teams Edit Mode -->
        <CollapsibleSection
          v-if="editor.isEditing.value"
          title="Teams"
          :defaultExpanded="true">
          <MultiSelectBox
            :options="teamsLoader.options.value"
            :label="'Select teams'"
            :loading="teamsLoader.isLoading.value"
            :hasMore="teamsLoader.hasMore.value"
            @loadMore="teamsLoader.loadMore"
            @search="teamsLoader.handleSearch"
            @changed="onTeamChanged"
            v-model="selectedTeamIds"
          />
        </CollapsibleSection>

        <!-- Related Users -->
        <CollapsibleSection
          v-if="!editor.isEditing.value && relatedUsers.length > 0"
          title="Users"
          :defaultExpanded="false">
          <Table
            :headers="userTableHeaders"
            :rows="userTableRows"
          />
        </CollapsibleSection>

        <!-- Users Edit Mode -->
        <CollapsibleSection
          v-if="editor.isEditing.value"
          title="Users"
          :defaultExpanded="true">
          <MultiSelectBox
            :options="usersLoader.options.value"
            :label="'Select users'"
            :loading="usersLoader.isLoading.value"
            :hasMore="usersLoader.hasMore.value"
            @loadMore="usersLoader.loadMore"
            @search="usersLoader.handleSearch"
            @changed="onUserChanged"
            v-model="selectedUserIds"
          />
        </CollapsibleSection>
      </div>
    </template>

  </Sidebar>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as *;

h2 {
  margin: 0 0 20px;
  font-size: 22px;
}

.action-buttons {
  margin: 16px 0 20px;
  display: flex;
  gap: 10px;
}

.error-banner {
  background-color: $color_danger_soft;
  border: 1px solid rgba($color_danger, 0.35);
  color: $color_danger;
  padding: 12px 16px;
  border-radius: $radius_md;
  margin: 12px 0;
  font-size: 13px;
  font-weight: 500;
}

.organization-details {
  margin-top: 20px;

  .detail-field {
    display: flex;
    margin-bottom: 16px;
    align-items: flex-start;

    &:last-child {
      margin-bottom: 0;
    }

    .field-label {
      font-size: 13px;
      font-weight: 600;
      min-width: 160px;
      padding-top: 10px;
      color: $text_secondary;
    }

    .field-value {
      flex: 1;

      p {
        margin: 0;
        padding: 9px 0;
        color: $text_primary;
      }

      .mono-value {
        font-family: $font_mono;
        font-size: 13px;
        color: $text_secondary;
      }

      .avatar-display {
        max-width: 160px;
        max-height: 160px;
        border-radius: $radius_lg;
        border: 1px solid $border_color;
        box-shadow: $shadow_sm;
        object-fit: contain;
      }

      .no-avatar {
        color: $text_muted;
        font-style: italic;
      }
    }
  }

  .loading-message {
    color: $text_muted;
    font-style: italic;
    margin: 10px 0;
  }
}
</style>