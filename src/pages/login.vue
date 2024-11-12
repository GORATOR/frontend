<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../store/user.ts'
import { redirectHome } from '../utils/redirects.ts'
import TextBox from '../components/textbox.vue'

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
            <div v-if="store.loading">
                <button disabled>{{ $t('login.submit') }}</button>
            </div>
            <div v-else>
                <button @click="goLogin">{{ $t('login.submit') }}</button>
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

        @media ($sm <= width) {
            width: 300px;
        }
    }
}
</style>