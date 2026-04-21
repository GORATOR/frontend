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
    margin-bottom: 8px;
    font-weight: 500;
  }

  .upload-area {
    position: relative;

    .file-input {
      display: none;
    }

    .upload-placeholder {
      border: 2px dashed $main_theme_background_lighter1;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;

      &:hover {
        border-color: $main_theme_active_color;
        background: #f5f5f5;
      }

      &.dragging {
        border-color: $main_theme_active_color;
        background: #e8f4fd;
        transform: scale(1.02);
      }

      .upload-icon {
        font-size: 48px;
        margin-bottom: 10px;
      }

      .upload-text {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 5px;
      }

      .upload-hint {
        font-size: 12px;
        color: #999;
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
        border-radius: 8px;
        border: 1px solid $main_theme_background_lighter1;
        object-fit: contain;
      }

      .preview-actions {
        display: flex;
        gap: 10px;

        button {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid $main_theme_background_lighter1;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;

          &.btn-change {
            background: white;
            color: $main_theme_active_color;
            border-color: $main_theme_active_color;

            &:hover {
              background: $main_theme_active_color;
              color: white;
            }
          }

          &.btn-remove {
            background: white;
            color: #dc3545;
            border-color: #dc3545;

            &:hover {
              background: #dc3545;
              color: white;
            }
          }
        }
      }
    }
  }
}
</style>