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
</script>

<template>
    <select v-model="$i18n.locale">
        <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">
            {{ locale }}
        </option>
    </select>
    <div class="container">
        <div class="content-form">
            <TextBox :label="$t('login.login_field')" v-model="username" />
            <TextBox :label="$t('login.password_field')" type="password" v-model="password" />
            <div class="form-buttons">
                <Button v-if="store.loading" disabled>{{ $t('login.submit') }}</Button>
                <Button v-else @click="goLogin">{{ $t('login.submit') }}</Button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '../assets/variables.scss' as *;

.container {
    justify-items: center;
    padding: 100px 50px;

    .content-form {
        margin: auto;
        width: 200px;

        @media ($sm <=width) {
            width: 300px;
        }

        .form-buttons {
            padding-top: 14px;
            display: flex;
            justify-content: end;
        }
    }
}
</style>