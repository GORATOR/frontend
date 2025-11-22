import { ref, Ref } from 'vue'
import { sendPut } from './requests'

export interface EntityEditorOptions<T> {
  entity: Ref<T>
  entityType: string // e.g., 'user', 'team', 'organization', 'project'
  onEditStart?: () => void | Promise<void>
  onSaveSuccess?: () => void | Promise<void>
  prepareUpdateData?: (entity: T) => any
  additionalStateToSave?: () => Record<string, any>
  restoreAdditionalState?: (state: Record<string, any>) => void
}

export function useEntityEditor<T>(options: EntityEditorOptions<T>) {
  const {
    entity,
    entityType,
    onEditStart,
    onSaveSuccess,
    prepareUpdateData,
    additionalStateToSave,
    restoreAdditionalState
  } = options

  const isEditing = ref(false)
  const loading = ref(false)
  const saveError = ref('')

  let originalEntity: T | null = null
  let originalAdditionalState: Record<string, any> = {}

  function startEdit() {
    // Save original data
    originalEntity = JSON.parse(JSON.stringify(entity.value))
    if (additionalStateToSave) {
      originalAdditionalState = additionalStateToSave()
    }

    saveError.value = ''
    isEditing.value = true

    // Execute custom logic on edit start
    if (onEditStart) {
      onEditStart()
    }
  }

  function cancelEdit() {
    if (originalEntity) {
      // Restore original data
      entity.value = JSON.parse(JSON.stringify(originalEntity))

      if (restoreAdditionalState && originalAdditionalState) {
        restoreAdditionalState(originalAdditionalState)
      }
    }

    saveError.value = ''
    isEditing.value = false
  }

  async function saveEntity(): Promise<boolean> {
    saveError.value = ''

    // Prepare update data
    const updateData = prepareUpdateData
      ? prepareUpdateData(entity.value)
      : entity.value

    loading.value = true

    try {
      const response = await sendPut(`/${entityType}`, updateData)

      if (response.status === 200) {
        console.log('save successful')

        // Execute success callback
        if (onSaveSuccess) {
          await onSaveSuccess()
        }

        isEditing.value = false
        return true
      } else {
        console.log('save failed with status:', response.status)
        saveError.value = 'Failed to save changes. Please try again.'

        // Restore original data on error
        if (originalEntity) {
          entity.value = JSON.parse(JSON.stringify(originalEntity))

          //todo: implement feature flag
          //uncomment if you want to restore previous component state
          /*if (restoreAdditionalState && originalAdditionalState) {
            restoreAdditionalState(originalAdditionalState)
          }*/
        }

        return false
      }
    } catch (error) {
      console.error('save error:', error)
      saveError.value = 'An error occurred while saving. Please try again.'

      // Restore original data on error
      if (originalEntity) {
        entity.value = JSON.parse(JSON.stringify(originalEntity))

        if (restoreAdditionalState && originalAdditionalState) {
          restoreAdditionalState(originalAdditionalState)
        }
      }

      return false
    } finally {
      loading.value = false
    }
  }

  function getButtonCaption(): string {
    return isEditing.value ? 'SAVE' : 'EDIT'
  }

  async function handleActionButton(): Promise<void> {
    if (isEditing.value) {
      await saveEntity()
    } else {
      startEdit()
    }
  }

  return {
    isEditing,
    loading,
    saveError,
    startEdit,
    cancelEdit,
    saveEntity,
    getButtonCaption,
    handleActionButton
  }
}
