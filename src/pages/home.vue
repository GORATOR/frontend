<script setup lang="ts">
import { useUserStore } from '../store/user.ts'
import Sidebar from '../components/Sidebar.vue'

const store = useUserStore()
</script>

<template>
    <Sidebar>
        <div class="home">
            <h2>Welcome to GORATOR</h2>
            <p class="session-info">Your session is <span class="mono">{{ store.sessionId }}</span></p>
        </div>
    </Sidebar>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;

.home {
    max-width: 560px;
    margin: 48px auto;
    padding: 32px;
    background: $card_background;
    border: 1px solid $border_color;
    border-radius: $radius_lg;
    box-shadow: $shadow_sm;
    text-align: center;

    h2 {
        margin: 0 0 12px;
        font-size: 22px;
    }

    .session-info {
        margin: 0;
        font-size: 13px;
        color: $text_muted;
        word-break: break-all;

        .mono {
            font-family: $font_mono;
            font-size: 12px;
            color: $text_secondary;
        }
    }
}
</style>
