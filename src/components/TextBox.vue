<script setup lang="ts">
const model = defineModel<string>()
const props = defineProps<{
    label: string,
    type?: string
}>()
</script>

<template>
    <div class="textbox-container">
        <label class="label">
            {{ props.label }}
            <input class="textbox" :type="props.type ?? 'text'" v-model="model" />
        </label>
    </div>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;

.textbox-container {
    padding: 5px 0;

    .label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: $text_secondary;
    }

    .textbox {
        display: block;
        width: 100%;
        margin-top: 6px;
        padding: 9px 12px;
        border: 1px solid $border_color_strong;
        border-radius: $radius_md;
        background: $card_background;
        font-size: 14px;
        color: $text_primary;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;

        &::placeholder {
            color: $text_muted;
        }

        &:hover {
            border-color: $text_muted;
        }
    }

    .textbox:focus {
        outline: none;
        border-color: $main_theme_active_color;
        box-shadow: $focus_ring;
    }
}
</style>
