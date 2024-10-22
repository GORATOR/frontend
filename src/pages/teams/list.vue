<script setup lang="ts">
import { useRouter } from 'vue-router'
import Sidebar from '../../components/sidebar.vue'

const router = useRouter()

const gotoCreate = () => router.push({ path: "/teams/new" })
</script>

<template>
    <Sidebar>
        Team list here

        <button @click="gotoCreate">CREATE</button>
    </Sidebar>
</template>