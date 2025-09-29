<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref, computed} from "vue";
import {EntityName} from "../../models/count.ts";
import {Project, ProjectUpdate} from "../../models/project.ts";
import {getEntityId, readEntity, generateEntityRecordUrl} from "../../service/readEntity.ts";
import {updateProject} from "../../service/updateEntity.ts";
import Button from "../../components/Button.vue";
import TextBox from "../../components/TextBox.vue";
import ImageUpload from "../../components/ImageUpload.vue";
import SelectBox, {DEFAULT_LIMIT} from "../../components/SelectBox.vue";
import {SelectBoxOption} from "../../models/SelectBoxOption.ts";
import {loadTeams} from "../../service/loadList.ts";
import {Team} from "../../models/team.ts";

const loaded = ref(false);
const project = ref<Project>({} as Project);
const team = ref<Team | null>(null);
let isEditing = ref<boolean>(false);
const loading = ref<boolean>(false);
const showEnvelopeKey = ref<boolean>(false);
const copySuccess = ref<boolean>(false);

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

function editSwitch() : void {
  isEditing.value = !isEditing.value;
  if (isEditing.value && teamOptions.value.length === 0) {
    loadTeamsList(true);
  }
}

function getButtonCaption(): string {
  return isEditing.value ? 'SAVE' : 'EDIT';
}

async function actionButtonClick(): Promise<void> {
  if (isEditing.value) {
    const updateData: ProjectUpdate = {
      ID: project.value.ID,
      Name: project.value.Name,
      TeamId: parseInt(selectedTeamId.value),
      Avatar: project.value.Avatar
    };

    await updateProject(loading, updateData);

    // Reload team info after update
    if (updateData.TeamId) {
      team.value = await readEntity(EntityName.Team, updateData.TeamId);
    }
  }
  editSwitch();
}

const teamUrl = computed(() => {
  return team.value ? generateEntityRecordUrl(EntityName.Team, team.value.ID) : '#';
});

const maskedEnvelopeKey = computed(() => {
  if (!project.value.EnvelopeKey) return '';
  return '•'.repeat(project.value.EnvelopeKey.length);
});

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(project.value.EnvelopeKey);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

initLoad();

</script>

<template>
  <Sidebar :active=MenuItem.Projects>
    <template v-if="loaded">
      <h2>{{ project?.Name }}</h2>

      <div class="action-buttons">
        <Button @click="actionButtonClick">{{getButtonCaption()}}</Button>
      </div>

      <div class="project-details">
        <div class="detail-section">
          <h3>Project Information</h3>

          <div class="detail-field">
            <label class="field-label">Project Avatar:</label>
            <div class="field-value">
              <img v-if="!isEditing && project?.Avatar" :src="project.Avatar" alt="Project Avatar" class="avatar-display" />
              <p v-if="!isEditing && !project?.Avatar" class="no-avatar">No avatar</p>
              <ImageUpload v-if="isEditing" label="" v-model="project.Avatar" :currentImage="project.Avatar" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Project Name:</label>
            <div class="field-value">
              <p v-if="!isEditing">{{ project?.Name }}</p>
              <TextBox v-if="isEditing" label="" v-model="project.Name" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Team:</label>
            <div class="field-value">
              <p v-if="!isEditing && team">
                <a :href="teamUrl" class="team-link">{{ team.Name }}</a>
              </p>
              <p v-if="!isEditing && !team">No team assigned</p>
              <SelectBox
                v-if="isEditing"
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
            <label class="field-label">Project ID:</label>
            <div class="field-value">
              <p>{{ project?.ID }}</p>
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Envelope Key:</label>
            <div class="field-value envelope-key-container">
              <input
                type="text"
                :value="showEnvelopeKey ? project?.EnvelopeKey : maskedEnvelopeKey"
                readonly
                class="envelope-key-input"
                @focus="showEnvelopeKey = true"
                @blur="showEnvelopeKey = false"
              />
              <button
                @click="copyToClipboard"
                class="copy-button"
                :class="{ 'copied': copySuccess }"
                type="button"
                title="Copy to clipboard">
                <span v-if="!copySuccess">📋</span>
                <span v-else>✓</span>
              </button>
            </div>
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

        .envelope-key-container {
          display: flex;
          gap: 8px;
          align-items: center;

          .envelope-key-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid $main_theme_background_lighter1;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            background: #f8f9fa;
            cursor: pointer;
            transition: all 0.2s ease;

            &:focus {
              outline: none;
              border-color: $main_theme_active_color;
              background: white;
              box-shadow: 0 0 0 2px rgba($main_theme_active_color, 0.1);
            }
          }

          .copy-button {
            padding: 8px 12px;
            border: 1px solid $main_theme_background_lighter1;
            border-radius: 6px;
            background: white;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 40px;

            &:hover {
              background: $main_theme_active_color;
              border-color: $main_theme_active_color;
              transform: scale(1.05);
            }

            &.copied {
              background: #28a745;
              border-color: #28a745;
              color: white;
            }
          }
        }
      }
    }
  }
}
</style>