<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref, computed} from "vue";
import {EntityName} from "../../models/count.ts";
import {Project, ProjectUpdate} from "../../models/project.ts";
import {getEntityId, readEntity, generateEntityRecordUrl} from "../../service/readEntity.ts";
import {useEntityEditor} from "../../utils/useEntityEditor.ts";
import Button from "../../components/Button.vue";
import TextBox from "../../components/TextBox.vue";
import ImageUpload from "../../components/ImageUpload.vue";
import SelectBox, {DEFAULT_LIMIT} from "../../components/SelectBox.vue";
import {SelectBoxOption} from "../../models/SelectBoxOption.ts";
import {loadTeams} from "../../service/loadList.ts";
import {Team} from "../../models/team.ts";
import MaskedInput from "../../components/MaskedInput.vue";

const loaded = ref(false);
const project = ref<Project>({} as Project);
const team = ref<Team | null>(null);

// Team selection
const teamOptions = ref<SelectBoxOption[]>([]);
const selectedTeamId = ref<string>("");
const hasMore = ref(true);
const isLoadingMore = ref(false);
const teamOffset = ref(0);
const teamsLoaded = ref(false);
const currentSearchQuery = ref('');

async function initLoad() {
  try {
    project.value = await readEntity(EntityName.Project, getEntityId(EntityName.Project))
    selectedTeamId.value = project.value.TeamId.toString();

    // Load team info
    if (project.value.TeamId) {
      team.value = await readEntity(EntityName.Team, project.value.TeamId);
    }

    loaded.value = true;
  } catch (e) {
    console.log(e);
  }
}

async function loadTeamsList(reset = false, search = '') {
  if (reset) {
    teamOffset.value = 0
    teamOptions.value = []
    hasMore.value = true
    currentSearchQuery.value = search
  }

  if (isLoadingMore.value) {
    return
  }

  isLoadingMore.value = true
  const data = await loadTeams(teamsLoaded, teamOffset.value, DEFAULT_LIMIT, search)

  if (data.length > 0) {
    const newOptions = data.map(el => (<SelectBoxOption>{
      value: el.ID.toString(),
      label: el.Name
    }))

    if (reset) {
      teamOptions.value = newOptions
    } else {
      const existingValues = new Set(teamOptions.value.map(opt => opt.value))
      const filteredNewOptions = newOptions.filter(opt => !existingValues.has(opt.value))
      teamOptions.value = [...teamOptions.value, ...filteredNewOptions]
    }

    teamOffset.value += data.length
    hasMore.value = data.length === DEFAULT_LIMIT;
  } else {
    hasMore.value = false
  }

  isLoadingMore.value = false
}

async function loadMoreTeams() {
  await loadTeamsList(false, currentSearchQuery.value)
}

async function handleTeamSearch(query: string) {
  await loadTeamsList(true, query)
}

// Initialize entity editor composable
const editor = useEntityEditor({
  entity: project,
  entityType: 'project',
  onEditStart: () => {
    if (teamOptions.value.length === 0) {
      loadTeamsList(true);
    }
  },
  onSaveSuccess: async () => {
    await initLoad();
  },
  prepareUpdateData: (project) => {
    const updateData: ProjectUpdate = {
      ID: project.ID,
      Name: project.Name,
      TeamId: parseInt(selectedTeamId.value),
      Avatar: project.Avatar
    };
    return updateData;
  },
  additionalStateToSave: () => ({
    selectedTeamId: selectedTeamId.value
  }),
  restoreAdditionalState: (state) => {
    selectedTeamId.value = state.selectedTeamId || '';
  }
});

async function actionButtonClick(): Promise<void> {
  await editor.handleActionButton();
}

const teamUrl = computed(() => {
  return team.value ? generateEntityRecordUrl(EntityName.Team, team.value.ID) : '#';
});

const dsn = computed(() => {
  if(!project.value.EnvelopeKey) {
    return '';
  }
  return location.origin.replace('://', `://${project.value.EnvelopeKey}@`) + `/api/${project.value.ID}`;
});

initLoad();

</script>

<template>
  <Sidebar :active=MenuItem.Projects>
    <template v-if="loaded">
      <h2>{{ project?.Name }}</h2>

      <div class="action-buttons">
        <Button @click="actionButtonClick">{{editor.getButtonCaption()}}</Button>
        <Button v-if="editor.isEditing.value" @click="editor.cancelEdit">CANCEL</Button>
      </div>

      <div v-if="editor.saveError.value" class="error-banner">
        {{ editor.saveError.value }}
      </div>

      <div class="project-details">
        <div class="detail-section">
          <h3>Project Information</h3>

          <div class="detail-field">
            <label class="field-label">Project Avatar:</label>
            <div class="field-value">
              <img v-if="!editor.isEditing.value && project?.Avatar" :src="project.Avatar" alt="Project Avatar" class="avatar-display" />
              <p v-if="!editor.isEditing.value && !project?.Avatar" class="no-avatar">No avatar</p>
              <ImageUpload v-if="editor.isEditing.value" label="" v-model="project.Avatar" :currentImage="project.Avatar" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Project Name:</label>
            <div class="field-value">
              <p v-if="!editor.isEditing.value">{{ project?.Name }}</p>
              <TextBox v-if="editor.isEditing.value" label="" v-model="project.Name" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Team:</label>
            <div class="field-value">
              <p v-if="!editor.isEditing.value && team">
                <a :href="teamUrl" class="team-link">{{ team.Name }}</a>
              </p>
              <p v-if="!editor.isEditing.value && !team">No team assigned</p>
              <SelectBox
                v-if="editor.isEditing.value"
                :options="teamOptions"
                :label="'Select team'"
                :loading="isLoadingMore"
                :hasMore="hasMore"
                @loadMore="loadMoreTeams"
                @search="handleTeamSearch"
                v-model="selectedTeamId">
              </SelectBox>
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">DSN:</label>
            <MaskedInput :value="dsn" />
          </div>

          <div class="detail-field">
            <label class="field-label">Envelope Key:</label>
            <MaskedInput :value="project?.EnvelopeKey" />
          </div>
        </div>
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

.project-details {
  margin-top: 20px;

  .detail-section {
    background: white;
    border: 1px solid $main_theme_background_lighter1;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;

    h3 {
      margin-top: 0;
      margin-bottom: 20px;
      color: $main_theme_active_color;
      font-size: 18px;
      border-bottom: 2px solid $main_theme_background_lighter1;
      padding-bottom: 10px;
    }

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

        .team-link {
          color: $main_theme_active_color;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
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
  }
}
</style>