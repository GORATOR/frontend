<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../store/user.ts'
import { redirectHome } from '../utils/redirects.ts'
import TextBox from '../components/TextBox.vue'
import Button from '../components/Button.vue'

const store = useUserStore()
const username = ref<string>("")
const password = ref<string>("")

async function goLogin() {
    const success = await store.login(username.value, password.value)
    if (success) {
        redirectHome()
    }
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !store.loading) {
        goLogin()
    }
}
</script>

<template>
    <div class="login-page">
        <select class="locale-select" v-model="$i18n.locale">
            <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">
                {{ locale }}
            </option>
        </select>
        <div class="container">
            <div class="login-card" @keydown="handleKeydown">
                <div class="brand">
                    <span class="brand-mark">G</span>
                    <span class="brand-name">GORATOR</span>
                </div>
                <p class="login-subtitle">{{ $t('login.subtitle') }}</p>
                <TextBox :label="$t('login.login_field')" v-model="username" />
                <TextBox :label="$t('login.password_field')" type="password" v-model="password" />
                <div class="form-buttons">
                    <Button v-if="store.loading" disabled>{{ $t('login.submit') }}</Button>
                    <Button v-else @click="goLogin">{{ $t('login.submit') }}</Button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '../assets/variables.scss' as *;

.login-page {
    min-height: 100vh;
    background:
        radial-gradient(1000px 500px at 85% -10%, rgba($main_theme_active_color, 0.35), transparent 60%),
        radial-gradient(800px 500px at 10% 110%, rgba(#3f59e5, 0.3), transparent 60%),
        linear-gradient(160deg, $sidebar_gradient_start 0%, $sidebar_gradient_end 100%);
}

.locale-select {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 6px 10px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: $radius_sm;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;

    option {
        color: $text_primary;
    }
}

.container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;

    .login-card {
        width: 100%;
        max-width: 380px;
        padding: 36px 32px 28px;
        background: $card_background;
        border-radius: $radius_xl;
        box-shadow: $shadow_lg;

        .brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 6px;

            .brand-mark {
                display: grid;
                place-content: center;
                width: 34px;
                height: 34px;
                border-radius: 9px;
                background: linear-gradient(135deg, $main_theme_active_color 0%, #3f59e5 100%);
                color: white;
                font-family: $font_heading;
                font-weight: 700;
                font-size: 18px;
            }

            .brand-name {
                color: $main_theme_background;
                font-family: $font_heading;
                font-weight: 700;
                font-size: 17px;
                letter-spacing: 0.12em;
            }
        }

        .login-subtitle {
            margin: 0 0 20px;
            text-align: center;
            color: $text_secondary;
            font-size: 14px;
        }

        .form-buttons {
            padding-top: 16px;
            display: flex;

            :deep(.btn) {
                width: 100%;
            }
        }
    }
}
</style>
