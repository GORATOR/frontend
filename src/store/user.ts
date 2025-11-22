import { ref, computed } from "vue"
import { defineStore } from "pinia"
import { sendPost, sendGet } from "../utils/requests"
import type { Role } from "../models/role"

const SESSIONID_LOCAL_STORAGE_KEY = 'sessionId'
const USER_DATA_LOCAL_STORAGE_KEY = 'userData'

interface StoredUserData {
    username: string
    currentUserId: number
    roles: Role[]
}

function saveSessionId(sessionId: string) {
    localStorage.setItem(SESSIONID_LOCAL_STORAGE_KEY, sessionId)
}

function removeSessionId() {
    localStorage.removeItem(SESSIONID_LOCAL_STORAGE_KEY)
}

function loadSessionId(): string | null {
    return localStorage.getItem(SESSIONID_LOCAL_STORAGE_KEY)
}

function saveUserData(username: string, userId: number, roles: Role[]) {
    const data: StoredUserData = {
        username,
        currentUserId: userId,
        roles
    }
    localStorage.setItem(USER_DATA_LOCAL_STORAGE_KEY, JSON.stringify(data))
}

function loadUserData(): StoredUserData | null {
    const data = localStorage.getItem(USER_DATA_LOCAL_STORAGE_KEY)
    if (data) {
        try {
            return JSON.parse(data)
        } catch {
            return null
        }
    }
    return null
}

function removeUserData() {
    localStorage.removeItem(USER_DATA_LOCAL_STORAGE_KEY)
}

export const useUserStore = defineStore('user', () => {
    const storedSessionId = loadSessionId()
    const storedUserData = loadUserData()

    const sessionId = ref<string | null>(storedSessionId)
    const logined = ref(!!storedSessionId)
    const loading = ref(false)
    const username = ref<string | null>(storedUserData?.username || null)
    const currentUserId = ref<number | null>(storedUserData?.currentUserId || null)
    const roles = ref<Role[]>(storedUserData?.roles || [])

    function cleanStoredSession() {
        sessionId.value = null
        removeSessionId()
        removeUserData()
    }

    async function loadCurrentUser(): Promise<boolean> {
        if (sessionId.value) {
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

                // Save user data to localStorage
                saveUserData(data.Username, data.ID, data.Roles || [])

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
            sessionId.value = data.sessionId
            saveSessionId(data.sessionId)

            logined.value = true

            // Load full user data including roles
            await loadCurrentUser()
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

    function logout() {
        cleanStoredSession()
        logined.value = false
        username.value = null
        currentUserId.value = null
        roles.value = []
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
        logout,
        loadCurrentUser,
        canEditUser
    }
})