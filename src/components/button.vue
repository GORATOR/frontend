<script setup lang="ts">
</script>

<template>
    <button class="btn">
        <slot></slot>
    </button>
</template>

<style scoped lang="scss">
.btn {
    padding: 7px;
    border-radius: 7px;
    border-style: solid;
    border-color: #333;
    background-color: transparent;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #0085f2;
        outline: medium solid #0085f26e;
        outline-width: 3px;
    }
}
</style>