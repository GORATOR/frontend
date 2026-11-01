<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref, computed} from "vue";
import {EntityName} from "../../models/count.ts";
import {Team} from "../../models/team.ts";
import {User} from "../../models/user.ts";
import {Organization} from "../../models/organization.ts";
import {Project} from "../../models/project.ts";
import {getEntityId, readEntity, generateEntityRecordUrl} from "../../service/readEntity.ts";
import Button from "../../components/Button.vue";
import TextBox from "../../components/TextBox.vue";
import ImageUpload from "../../components/ImageUpload.vue";
import CollapsibleSection from "../../components/CollapsibleSection.vue";
import Table from "../../components/Table.vue";
import {useEntityEditor} from "../../utils/useEntityEditor.ts";
import MultiSelectBox, { MultiSelectBoxElement } from "../../components/MultiSelectBox.vue";
import {loadOrganizations, loadUsers, loadProjects} from "../../service/loadList.ts";
import {useEntityLoader} from "../../utils/useEntityLoader.ts";

const loaded = ref(false);
const team = ref<Team>({} as Team );

// Related entities
const relatedUsers = ref<User[]>([]);
const relatedOrganizations = ref<Organization[]>([]);
const relatedProjects = ref<Project[]>([]);

// Selected IDs for editing
const selectedUserIds = ref<string[]>([]);
const selectedOrganizationIds = ref<string[]>([]);
const selectedProjectIds = ref<string[]>([]);

// Initialize entity loaders using composable
const usersLoader = useEntityLoader({
  loadFunction: loadUsers,
  mapToOption: (user) => ({
    value: user.ID.toString(),
    label: user.Username
  })
});

const organizationsLoader = useEntityLoader({
  loadFunction: loadOrganizations,
  mapToOption: (org) => ({
    value: org.ID.toString(),
    label: org.Name
  })
});

const projectsLoader = useEntityLoader({
  loadFunction: loadProjects,
  mapToOption: (project) => ({
    value: project.ID.toString(),
    label: project.Name
  })
});

// Initialize entity editor composable
const editor = useEntityEditor({
  entity: team,
  entityType: 'team',
  onEditStart: () => {
    usersLoader.loadData(true);
    organizationsLoader.loadData(true);
    projectsLoader.loadData(true);
  },
  onSaveSuccess: async () => {
    await initLoad();
  },
  prepareUpdateData: (team) => {
    return {
      ...team,
      UserIds: selectedUserIds.value.map(id => parseInt(id)),
      OrganizationIds: selectedOrganizationIds.value.map(id => parseInt(id)),
      ProjectIds: selectedProjectIds.value.map(id => parseInt(id))
    };
  },
  additionalStateToSave: () => ({
    selectedUserIds: [...selectedUserIds.value],
    selectedOrganizationIds: [...selectedOrganizationIds.value],
    selectedProjectIds: [...selectedProjectIds.value]
  }),
  restoreAdditionalState: (state) => {
    selectedUserIds.value = state.selectedUserIds || [];
    selectedOrganizationIds.value = state.selectedOrganizationIds || [];
    selectedProjectIds.value = state.selectedProjectIds || [];
  }
});

async function initLoad() {
  try {
    team.value = await readEntity(EntityName.Team, getEntityId(EntityName.Team))
    console.log('Loaded team:', team.value);

    // Load related entities from nested objects
    loadRelatedEntities();

    loaded.value = true;
  } catch (e) {
    console.log(e);
  }
}

function loadRelatedEntities() {
  // Use preloaded nested entities from backend
  if (team.value.Users && team.value.Users.length > 0) {
    relatedUsers.value = team.value.Users;
    selectedUserIds.value = team.value.Users.map(u => u.ID.toString());
    console.log('Loaded users:', relatedUsers.value);
  }

  if (team.value.Organizations && team.value.Organizations.length > 0) {
    relatedOrganizations.value = team.value.Organizations;
    selectedOrganizationIds.value = team.value.Organizations.map(o => o.ID.toString());
    console.log('Loaded organizations:', relatedOrganizations.value);
  }

  if (team.value.Projects && team.value.Projects.length > 0) {
    relatedProjects.value = team.value.Projects;
    selectedProjectIds.value = team.value.Projects.map(p => p.ID.toString());
    console.log('Loaded projects:', relatedProjects.value);
  }
}

async function actionButtonClick(): Promise<void> {
  await editor.handleActionButton();
}

// Change handlers for MultiSelectBox
function onUserChanged(el: MultiSelectBoxElement) {
  selectedUserIds.value = el.values;
}

function onOrganizationChanged(el: MultiSelectBoxElement) {
  selectedOrganizationIds.value = el.values;
}

function onProjectChanged(el: MultiSelectBoxElement) {
  selectedProjectIds.value = el.values;
}

const userTableHeaders = ['ID', 'Username', 'Email'];
const userTableRows = computed(() =>
  relatedUsers.value.map(user => ({
    ID: user.ID,
    Username: user.Username,
    Email: user.Email,
    url: generateEntityRecordUrl(EntityName.User, user.ID)
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

const projectTableHeaders = ['ID', 'Name'];
const projectTableRows = computed(() =>
  relatedProjects.value.map(project => ({
    ID: project.ID,
    Name: project.Name,
    url: generateEntityRecordUrl(EntityName.Project, project.ID)
  }))
);

initLoad();

</script>

<template>
  <Sidebar :active=MenuItem.Teams>
    <template v-if="loaded">
      <h2>{{ team?.Name }}</h2>

      <div class="action-buttons">
        <Button @click="actionButtonClick">{{editor.getButtonCaption()}}</Button>
        <Button v-if="editor.isEditing.value" variant="secondary" @click="editor.cancelEdit">CANCEL</Button>
      </div>

      <div v-if="editor.saveError.value" class="error-banner">
        {{ editor.saveError.value }}
      </div>

      <div class="team-details">
        <!-- Team Information -->
        <CollapsibleSection title="Team Information" :defaultExpanded="true">
          <div class="detail-field">
            <label class="field-label">Team Avatar:</label>
            <div class="field-value">
              <img v-if="!editor.isEditing.value && team?.Avatar" :src="team.Avatar" alt="Team Avatar" class="avatar-display" />
              <p v-if="!editor.isEditing.value && !team?.Avatar" class="no-avatar">No avatar</p>
              <ImageUpload v-if="editor.isEditing.value" label="" v-model="team.Avatar" :currentImage="team.Avatar" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Team Name:</label>
            <div class="field-value">
              <p v-if="!editor.isEditing.value">{{ team?.Name }}</p>
              <TextBox v-if="editor.isEditing.value" label="" v-model="team.Name" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Team ID:</label>
            <div class="field-value">
              <p class="mono-value">{{ team?.ID }}</p>
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

        <!-- Related Projects -->
        <CollapsibleSection
          v-if="!editor.isEditing.value && relatedProjects.length > 0"
          title="Projects"
          :defaultExpanded="false">
          <Table
            :headers="projectTableHeaders"
            :rows="projectTableRows"
          />
        </CollapsibleSection>

        <!-- Projects Edit Mode -->
        <CollapsibleSection
          v-if="editor.isEditing.value"
          title="Projects"
          :defaultExpanded="true">
          <MultiSelectBox
            :options="projectsLoader.options.value"
            :label="'Select projects'"
            :loading="projectsLoader.isLoading.value"
            :hasMore="projectsLoader.hasMore.value"
            @loadMore="projectsLoader.loadMore"
            @search="projectsLoader.handleSearch"
            @changed="onProjectChanged"
            v-model="selectedProjectIds"
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

.team-details {
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