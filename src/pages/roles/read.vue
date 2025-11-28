<script setup lang="ts">
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import Sidebar from '../../components/Sidebar.vue'
import { ref, computed } from 'vue'
import type { Role, Rule } from '../../models/role.ts'
import { User } from '../../models/user.ts'
import { EntityName } from '../../models/count.ts'
import { getEntityId, readEntity, generateEntityRecordUrl } from '../../service/readEntity.ts'
import { useEntityEditor } from '../../utils/useEntityEditor.ts'
import Button from '../../components/Button.vue'
import TextBox from '../../components/TextBox.vue'
import CollapsibleSection from '../../components/CollapsibleSection.vue'
import Table from '../../components/Table.vue'
import RulesTable from '../../components/RulesTable.vue'
import MultiSelectBox, { MultiSelectBoxElement } from '../../components/MultiSelectBox.vue'
import { loadUsers } from '../../service/loadList.ts'
import { useEntityLoader } from '../../utils/useEntityLoader.ts'

const loaded = ref(false)
const role = ref<Role>({} as Role)

// Related entities
const relatedUsers = ref<User[]>([])
const relatedRules = ref<Rule[]>([])

// Selected IDs for editing
const selectedUserIds = ref<string[]>([])
const editableRules = ref<Rule[]>([])

// Initialize entity loaders using composable
const usersLoader = useEntityLoader({
  loadFunction: loadUsers,
  mapToOption: (user) => ({
    value: user.ID.toString(),
    label: user.Username
  })
})

// Initialize entity editor composable
const editor = useEntityEditor({
  entity: role,
  entityType: 'role',
  onEditStart: () => {
    usersLoader.loadData(true)
    editableRules.value = [...relatedRules.value]
  },
  onSaveSuccess: async () => {
    await initLoad()
  },
  prepareUpdateData: (role) => {
    return {
      ...role,
      UserIds: selectedUserIds.value.map(id => parseInt(id)),
      Rules: editableRules.value
    }
  },
  additionalStateToSave: () => ({
    selectedUserIds: [...selectedUserIds.value],
    editableRules: [...editableRules.value]
  }),
  restoreAdditionalState: (state) => {
    selectedUserIds.value = state.selectedUserIds || []
    editableRules.value = state.editableRules || []
  }
})

async function initLoad() {
  try {
    role.value = await readEntity(EntityName.Role, getEntityId(EntityName.Role))
    console.log('Loaded role:', role.value)

    // Load related entities from nested objects
    loadRelatedEntities()

    loaded.value = true
  } catch (e) {
    console.log(e)
  }
}

function loadRelatedEntities() {
  // Use preloaded nested entities from backend
  if (role.value.Users && role.value.Users.length > 0) {
    relatedUsers.value = role.value.Users
    selectedUserIds.value = role.value.Users.map(u => u.ID.toString())
  }
  if (role.value.Rules && role.value.Rules.length > 0) {
    relatedRules.value = role.value.Rules
  }
}

async function actionButtonClick(): Promise<void> {
  await editor.handleActionButton()
}

// Change handlers for MultiSelectBox
function onUserChanged(el: MultiSelectBoxElement) {
  selectedUserIds.value = el.values
}

const userTableHeaders = ['ID', 'Username', 'Email']
const userTableRows = computed(() =>
  relatedUsers.value.map(user => ({
    ID: user.ID,
    Username: user.Username,
    Email: user.Email,
    url: generateEntityRecordUrl(EntityName.User, user.ID)
  }))
)

initLoad()
</script>

<template>
  <Sidebar :active="MenuItem.Roles">
    <template v-if="loaded">
      <h2>{{ role?.Name }}</h2>

      <div class="action-buttons">
        <Button @click="actionButtonClick">{{ editor.getButtonCaption() }}</Button>
        <Button v-if="editor.isEditing.value" @click="editor.cancelEdit">CANCEL</Button>
      </div>

      <div v-if="editor.saveError.value" class="error-banner">
        {{ editor.saveError.value }}
      </div>

      <div class="role-details">
        <!-- Role Information -->
        <CollapsibleSection title="Role Information" :defaultExpanded="true">
          <div class="detail-field">
            <label class="field-label">Role Name:</label>
            <div class="field-value">
              <p v-if="!editor.isEditing.value">{{ role?.Name }}</p>
              <TextBox v-if="editor.isEditing.value" label="" v-model="role.Name" />
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Role ID:</label>
            <div class="field-value">
              <p>{{ role?.ID }}</p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Permissions (Rules) - View Mode -->
        <CollapsibleSection
          v-if="!editor.isEditing.value && relatedRules.length > 0"
          title="Permissions"
          :defaultExpanded="true">
          <RulesTable
            :modelValue="relatedRules"
            :readonly="true"
          />
        </CollapsibleSection>

        <!-- Permissions (Rules) - Edit Mode -->
        <CollapsibleSection
          v-if="editor.isEditing.value"
          title="Permissions"
          :defaultExpanded="true">
          <RulesTable
            v-model="editableRules"
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

.role-details {
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
    }
  }
}
</style>
