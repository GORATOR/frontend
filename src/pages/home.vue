<script setup lang="ts">
import { useUserStore } from '../store/user.ts'
import Sidebar from '../components/Sidebar.vue'

const store = useUserStore()
</script>

<template>
    <Sidebar>
        Your session is {{ store.sessionId }}
    </Sidebar>
</template>