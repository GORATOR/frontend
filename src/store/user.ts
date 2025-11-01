import { ref, computed } from "vue"
import { defineStore } from "pinia"
import { sendPost, sendGet } from "../utils/requests"
import type { Role } from "../models/role"

const SESSIONID_LOCAL_STORAGE_KEY = 'sessionId'

function saveSessionId(sessionId: string) {
    localStorage.setItem(SESSIONID_LOCAL_STORAGE_KEY, sessionId)
}
function removeSessionId() {
    localStorage.removeItem(SESSIONID_LOCAL_STORAGE_KEY)
}
function loadSessionId(): string | null {
    return localStorage.getItem(SESSIONID_LOCAL_STORAGE_KEY)
}

export const useUserStore = defineStore('user', () => {
    const storedSessionId = loadSessionId()

    const sessionId = ref<string | null>(storedSessionId)
    const logined = ref(false)
    const loading = ref(false)
    const username = ref<string | null>(null)
    const currentUserId = ref<number | null>(null)
    const roles = ref<Role[]>([])

    function cleanStoredSession() {
        sessionId.value = null
        removeSessionId()
    }

    async function loadCurrentUser(): Promise<boolean> {
        if (storedSessionId) {
            loading.value = true

            try {
                const response = await sendGet("/user/current")

                if (response.status != 200) {
                    console.error('Invalid response:', response)
                    cleanStoredSession()
                    return false
                }

                const data = await response.json()
                username.value = data.Username
                currentUserId.value = data.ID
                roles.value = data.Roles || []

                logined.value = true
                return true
            } catch (err) {
                console.error('Error:', err)
            } finally {
                loading.value = false
            }

            cleanStoredSession()
            return false
        }

        return true
    }

    async function login(user: string, password: string): Promise<boolean> {
        loading.value = true

        try {
            const response = await sendPost(
                "/login",
                {
                    username: user,
                    password: password
                })

            if (response.status != 200) {
                console.error('Invalid response:', response)
                return false
            }

            const data = await response.json()
            username.value = data.user.Username

            logined.value = true
            sessionId.value = data.sessionId
            saveSessionId(data.sessionId)
            return true
        } catch (err) {
            console.error('Error:', err)
        } finally {
            loading.value = false
        }

        return false
    }

    const isAdmin = computed(() => {
        return roles.value.some(role => role.Name === 'admin')
    })

    function canEditUser(userId: number): boolean {
        // Can edit if it's their own profile OR if they're an admin
        return currentUserId.value === userId || isAdmin.value
    }

    return {
        logined,
        loading,
        username,
        sessionId,
        currentUserId,
        roles,
        isAdmin,
        login,
        loadCurrentUser,
        canEditUser
    }
})