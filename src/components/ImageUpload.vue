<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  label: string;
  currentImage?: string;
}>();

const model = defineModel<string>();
const previewUrl = ref<string>(props.currentImage || '');
const fileInput = ref<HTMLInputElement>();
const isDragging = ref(false);

watch(() => props.currentImage, (newValue) => {
  if (newValue) {
    previewUrl.value = newValue;
  }
});

function processFile(file: File) {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should not exceed 5MB');
    return;
  }

  // Read file and convert to base64
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64String = e.target?.result as string;
    previewUrl.value = base64String;
    model.value = base64String;
  };
  reader.readAsDataURL(file);
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processFile(file);
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;

  const file = event.dataTransfer?.files[0];
  if (file) {
    processFile(file);
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}

function clearImage() {
  previewUrl.value = '';
  model.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}
</script>

<template>
  <div class="image-upload-container">
    <label class="label">{{ props.label }}</label>

    <div class="upload-area">
      <div v-if="previewUrl" class="preview-container">
        <img :src="previewUrl" alt="Preview" class="preview-image" />
        <div class="preview-actions">
          <button @click="triggerFileInput" class="btn-change" type="button">Change</button>
          <button @click="clearImage" class="btn-remove" type="button">Remove</button>
        </div>
      </div>

      <div
        v-else
        class="upload-placeholder"
        :class="{ 'dragging': isDragging }"
        @click="triggerFileInput"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop">
        <div class="upload-icon">📷</div>
        <div class="upload-text">Click or drag & drop to upload image</div>
        <div class="upload-hint">PNG, JPG up to 5MB</div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        class="file-input"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;

.image-upload-container {
  padding: 5px 0;

  .label {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
    color: $text_secondary;
  }

  .upload-area {
    position: relative;

    .file-input {
      display: none;
    }

    .upload-placeholder {
      border: 2px dashed $border_color_strong;
      border-radius: $radius_lg;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s ease, background-color 0.2s ease;
      background: $surface_subtle;

      &:hover {
        border-color: $main_theme_active_color;
        background: rgba($main_theme_active_color, 0.04);
      }

      &.dragging {
        border-color: $main_theme_active_color;
        background: rgba($main_theme_active_color, 0.08);
      }

      .upload-icon {
        font-size: 40px;
        margin-bottom: 10px;
      }

      .upload-text {
        font-size: 14px;
        font-weight: 500;
        color: $text_primary;
        margin-bottom: 5px;
      }

      .upload-hint {
        font-size: 12px;
        color: $text_muted;
      }
    }

    .preview-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;

      .preview-image {
        max-width: 128px;
        max-height: 128px;
        border-radius: $radius_md;
        border: 1px solid $border_color;
        box-shadow: $shadow_sm;
        object-fit: contain;
      }

      .preview-actions {
        display: flex;
        gap: 10px;

        button {
          padding: 7px 16px;
          border-radius: $radius_md;
          border: 1px solid $border_color_strong;
          background: $card_background;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.15s ease;

          &.btn-change {
            color: $main_theme_active_color;
            border-color: rgba($main_theme_active_color, 0.5);

            &:hover {
              background: $main_theme_active_color;
              border-color: $main_theme_active_color;
              color: white;
            }
          }

          &.btn-remove {
            color: $color_danger;
            border-color: rgba($color_danger, 0.4);

            &:hover {
              background: $color_danger;
              border-color: $color_danger;
              color: white;
            }
          }
        }
      }
    }
  }
}
</style>