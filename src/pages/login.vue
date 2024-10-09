<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user.ts'

const router = useRouter()
const store = useUserStore()
const username = ref<string>("")
const password = ref<string>("")

async function goLogin() {
    const success = await store.login(username.value, password.value)

    if (success) {
        router.push({ path: "/" })
    }
}
</script>

<template>
    <div class="container">
        <div class="row justify-content-end">
            <div class="col-1">
                <select class="form-select" v-model="$i18n.locale">
                    <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">
                        {{ locale }}
                    </option>
                </select>
            </div>
        </div>
    </div>
    <div class="row justify-content-center">
        <div class="col-md-4">
            <div>
                <label for="inputLogin" class="form-label">{{ $t('login.login_field') }}</label>
                <input type="text" class="form-control" id="inputLogin" v-model="username" />
            </div>
            <div>
                <label for="inputPassword" class="form-label">{{ $t('login.password_field') }}</label>
                <input type="password" class="form-control" id="inputPassword" v-model="password" />
            </div>
            <div class="py-3" v-if="store.loading">
                <button class="btn btn-primary" type="button" disabled>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                </button>
            </div>
            <div class="py-3" v-else>
                <button class="btn btn-primary" @click="goLogin">{{ $t('login.submit') }}</button>
            </div>
        </div>
    </div>
</template>