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
import {updateTeam} from "../../service/updateEntity.ts";

const loaded = ref(false);
const team = ref<Team>({} as Team );
let isEditing = ref<boolean>(false);
const loading = ref<boolean>(false);

// Related entities
const relatedUsers = ref<User[]>([]);
const relatedOrganizations = ref<Organization[]>([]);
const relatedProjects = ref<Project[]>([]);

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
    console.log('Loaded users:', relatedUsers.value);
  }

  if (team.value.Organizations && team.value.Organizations.length > 0) {
    relatedOrganizations.value = team.value.Organizations;
    console.log('Loaded organizations:', relatedOrganizations.value);
  }

  if (team.value.Projects && team.value.Projects.length > 0) {
    relatedProjects.value = team.value.Projects;
    console.log('Loaded projects:', relatedProjects.value);
  }
}

function editSwitch() : void {
  isEditing.value = !isEditing.value;
}

function getButtonCaption(): string {
  return isEditing.value ? 'SAVE' : 'EDIT';
}

async function actionButtonClick(): Promise<void> {
  if (isEditing.value) {
    console.log('save action');
    await updateTeam(loading, team.value);
    console.log('edit disabled');
  } else {
    console.log('edit enabled');
  }
  editSwitch();
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
        <Button @click="actionButtonClick">{{getButtonCaption()}}</Button>
      </div>

      <div class="team-details">
        <!-- Team Information -->
        <CollapsibleSection title="Team Information" :defaultExpanded="true">
          <div class="detail-field">
            <label class="field-label">Team Avatar:</label>
            <div class="field-value">
              <img v-if="!isEditing && team?.Avatar" :src="team.Avatar" alt="Team Avatar" class="avatar-display" />
              <p v-if="!isEditing && !team?.Avatar" class="no-avatar">No avatar</p>
              <ImageUpload v-if="isEditing" label="" v-model="team.Avatar" :currentImage="team.Avatar" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Team Name:</label>
            <div class="field-value">
              <p v-if="!isEditing">{{ team?.Name }}</p>
              <TextBox v-if="isEditing" label="" v-model="team.Name" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Team ID:</label>
            <div class="field-value">
              <p>{{ team?.ID }}</p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Related Organizations -->
        <CollapsibleSection
          v-if="relatedOrganizations.length > 0"
          title="Organizations"
          :defaultExpanded="false">
          <Table
            :headers="organizationTableHeaders"
            :rows="organizationTableRows"
          />
        </CollapsibleSection>

        <!-- Related Projects -->
        <CollapsibleSection
          v-if="relatedProjects.length > 0"
          title="Projects"
          :defaultExpanded="false">
          <Table
            :headers="projectTableHeaders"
            :rows="projectTableRows"
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

.team-details {
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
    }
  }

  .loading-message {
    color: #999;
    font-style: italic;
    margin: 10px 0;
  }
}
</style>