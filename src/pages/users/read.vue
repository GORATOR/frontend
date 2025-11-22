<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref, computed} from "vue";
import {EntityName} from "../../models/count.ts";
import {User} from "../../models/user.ts";
import {Team} from "../../models/team.ts";
import {Organization} from "../../models/organization.ts";
import {Role} from "../../models/role.ts";
import {getEntityId, readEntity, generateEntityRecordUrl} from "../../service/readEntity.ts";
import {useEntityEditor} from "../../utils/useEntityEditor.ts";
import Button from "../../components/Button.vue";
import TextBox from "../../components/TextBox.vue";
import ImageUpload from "../../components/ImageUpload.vue";
import CollapsibleSection from "../../components/CollapsibleSection.vue";
import Table from "../../components/Table.vue";
import {useUserStore} from "../../store/user.ts";
import MultiSelectBox, { MultiSelectBoxElement } from "../../components/MultiSelectBox.vue";
import {loadTeams, loadOrganizations} from "../../service/loadList.ts";
import {useEntityLoader} from "../../utils/useEntityLoader.ts";

const loaded = ref(false);
const user = ref<User>({} as User);

// Password fields
const password = ref<string>('');
const confirmPassword = ref<string>('');
const passwordError = ref<string>('');

const userStore = useUserStore();
const canEdit = computed(() => {
  return user.value.ID ? userStore.canEditUser(user.value.ID) : false;
});

// Determine active menu item - show Profile for own profile, Users for admins viewing others
const activeMenuItem = computed(() => {
  if (user.value.ID === userStore.currentUserId) {
    return MenuItem.Profile;
  }
  return MenuItem.Users;
});

// Related entities
const relatedTeams = ref<Team[]>([]);
const relatedOrganizations = ref<Organization[]>([]);
const relatedRoles = ref<Role[]>([]);

// Selected IDs for editing
const selectedTeamIds = ref<string[]>([]);
const selectedOrganizationIds = ref<string[]>([]);

// Initialize entity loaders using composable
const teamsLoader = useEntityLoader({
  loadFunction: loadTeams,
  mapToOption: (team) => ({
    value: team.ID.toString(),
    label: team.Name
  })
});

const organizationsLoader = useEntityLoader({
  loadFunction: loadOrganizations,
  mapToOption: (org) => ({
    value: org.ID.toString(),
    label: org.Name
  })
});

// Initialize entity editor composable
const editor = useEntityEditor({
  entity: user,
  entityType: 'user',
  onEditStart: () => {
    // Load data for MultiSelectBoxes when entering edit mode
    teamsLoader.loadData(true);
    organizationsLoader.loadData(true);
  },
  onSaveSuccess: async () => {
    // Reload data from server to get the updated state
    await initLoad();
    // Clear passwords after successful save
    password.value = '';
    confirmPassword.value = '';
  },
  prepareUpdateData: (user) => {
    const updatePayload: any = {
      ID: user.ID,
      Username: user.Username,
      Email: user.Email,
      Avatar: user.Avatar,
      TeamIds: selectedTeamIds.value.map(id => parseInt(id)),
      OrganizationIds: selectedOrganizationIds.value.map(id => parseInt(id))
    };

    // Only include password if it's been set
    if (password.value && password.value.trim() !== '') {
      updatePayload.Password = password.value;
    }

    return updatePayload;
  },
  additionalStateToSave: () => ({
    selectedTeamIds: [...selectedTeamIds.value],
    selectedOrganizationIds: [...selectedOrganizationIds.value]
  }),
  restoreAdditionalState: (state) => {
    selectedTeamIds.value = state.selectedTeamIds || [];
    selectedOrganizationIds.value = state.selectedOrganizationIds || [];
  }
});

async function initLoad() {
  try {
    user.value = await readEntity(EntityName.User, getEntityId(EntityName.User))
    console.log('Loaded user:', user.value);

    // Load related entities from nested objects
    loadRelatedEntities();

    loaded.value = true;
  } catch (e) {
    console.log(e);
  }
}

function loadRelatedEntities() {
  // Use preloaded nested entities from backend
  if (user.value.Teams && user.value.Teams.length > 0) {
    relatedTeams.value = user.value.Teams;
    selectedTeamIds.value = user.value.Teams.map(t => t.ID.toString());
    console.log('Loaded teams:', relatedTeams.value);
  }

  if (user.value.Organizations && user.value.Organizations.length > 0) {
    relatedOrganizations.value = user.value.Organizations;
    selectedOrganizationIds.value = user.value.Organizations.map(o => o.ID.toString());
    console.log('Loaded organizations:', relatedOrganizations.value);
  }

  if (user.value.Roles && user.value.Roles.length > 0) {
    relatedRoles.value = user.value.Roles;
    console.log('Loaded roles:', relatedRoles.value);
  }
}

async function actionButtonClick(): Promise<void> {
  if (editor.isEditing.value) {
    console.log('save action');

    // Validate passwords if they are being changed
    if (password.value || confirmPassword.value) {
      if (password.value !== confirmPassword.value) {
        passwordError.value = 'Passwords do not match';
        return;
      }
      if (password.value.trim() === '') {
        passwordError.value = 'Password cannot be empty';
        return;
      }
    }

    passwordError.value = '';
    await editor.saveEntity();
  } else {
    console.log('edit enabled');
    editor.startEdit();
  }
}

function cancelEdit() : void {
  editor.cancelEdit();
  // Clear passwords when canceling
  password.value = '';
  confirmPassword.value = '';
  passwordError.value = '';
}

// Change handlers for MultiSelectBox
function onTeamChanged(el: MultiSelectBoxElement) {
  selectedTeamIds.value = el.values;
}

function onOrganizationChanged(el: MultiSelectBoxElement) {
  selectedOrganizationIds.value = el.values;
}

const teamTableHeaders = ['ID', 'Name'];
const teamTableRows = computed(() =>
  relatedTeams.value.map(team => ({
    ID: team.ID,
    Name: team.Name,
    url: generateEntityRecordUrl(EntityName.Team, team.ID)
  }))
);

const organizationTableHeaders = ['ID', 'Name'];
const organizationTableRows = computed(() =>
  relatedOrganizations.value.map(org => ({
    ID: org.ID,
    Name: org.Name,
    url: generateEntityRecordUrl(EntityName.Organization, org.ID)
  }))
);

const roleTableHeaders = ['ID', 'Name'];
const roleTableRows = computed(() =>
  relatedRoles.value.map(role => ({
    ID: role.ID,
    Name: role.Name
  }))
);

initLoad();

</script>

<template>
  <Sidebar :active="activeMenuItem">
    <template v-if="loaded">
      <h2>{{ user?.Username }}</h2>

      <div class="action-buttons" v-if="canEdit">
        <Button @click="actionButtonClick">{{editor.getButtonCaption()}}</Button>
        <Button v-if="editor.isEditing.value" @click="cancelEdit">CANCEL</Button>
      </div>

      <div v-if="editor.saveError.value" class="error-banner">
        {{ editor.saveError.value }}
      </div>

      <div class="user-details">
        <!-- User Information -->
        <CollapsibleSection title="User Information" :defaultExpanded="true">
          <div class="detail-field">
            <label class="field-label">User Avatar:</label>
            <div class="field-value">
              <img v-if="!editor.isEditing.value && user?.Avatar" :src="user.Avatar" alt="User Avatar" class="avatar-display" />
              <p v-if="!editor.isEditing.value && !user?.Avatar" class="no-avatar">No avatar</p>
              <ImageUpload v-if="editor.isEditing.value" label="" v-model="user.Avatar" :currentImage="user.Avatar" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Username:</label>
            <div class="field-value">
              <p v-if="!editor.isEditing.value">{{ user?.Username }}</p>
              <TextBox v-if="editor.isEditing.value" label="" v-model="user.Username" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Email:</label>
            <div class="field-value">
              <p v-if="!editor.isEditing.value">{{ user?.Email }}</p>
              <TextBox v-if="editor.isEditing.value" label="" v-model="user.Email" type="email" />
            </div>
          </div>

          <div v-if="editor.isEditing.value" class="detail-field">
            <label class="field-label">Password:</label>
            <div class="field-value">
              <TextBox label="" v-model="password" type="password" placeholder="Leave empty to keep current password" />
            </div>
          </div>

          <div v-if="editor.isEditing.value" class="detail-field">
            <label class="field-label">Confirm Password:</label>
            <div class="field-value">
              <TextBox label="" v-model="confirmPassword" type="password" placeholder="Confirm new password" />
              <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">User ID:</label>
            <div class="field-value">
              <p>{{ user?.ID }}</p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Related Organizations -->
        <CollapsibleSection
          v-if="!editor.isEditing.value && relatedOrganizations.length > 0"
          title="Organizations"
          :defaultExpanded="false">
          <Table
            :headers="organizationTableHeaders"
            :rows="organizationTableRows"
          />
        </CollapsibleSection>

        <!-- Organizations Edit Mode -->
        <CollapsibleSection
          v-if="editor.isEditing.value"
          title="Organizations"
          :defaultExpanded="true">
          <MultiSelectBox
            :options="organizationsLoader.options.value"
            :label="'Select organizations'"
            :loading="organizationsLoader.isLoading.value"
            :hasMore="organizationsLoader.hasMore.value"
            @loadMore="organizationsLoader.loadMore"
            @search="organizationsLoader.handleSearch"
            @changed="onOrganizationChanged"
            v-model="selectedOrganizationIds"
          />
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

        <!-- Related Roles -->
        <CollapsibleSection
          v-if="relatedRoles.length > 0"
          title="Roles"
          :defaultExpanded="false">
          <Table
            :headers="roleTableHeaders"
            :rows="roleTableRows"
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
  display: flex;
  gap: 10px;
}

.error-banner {
  background-color: #ffebee;
  border: 1px solid #f44336;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 0.9rem;
}

.user-details {
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
      min-width: 140px;
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

      .error-message {
        color: #d32f2f;
        font-size: 0.875rem;
        margin-top: 4px;
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
