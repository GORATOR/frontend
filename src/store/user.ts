import { ref } from "vue"
import { defineStore } from "pinia"
import { sendPost, sendGet } from "../utils/requests"

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

    function cleanStoredSession() {
        sessionId.value = null
        removeSessionId()
    }

    async function loadCurrentUser(): Promise<boolean> {
        if (storedSessionId) {
            loading.value = true

            try {
                var response = await sendGet("/user/current")

                if (response.status != 200) {
                    console.error('Invalid response:', response)
                    cleanStoredSession()
                    return false
                }

                const data = await response.json()
                username.value = data.Username

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
            sessionId.value = data.session_id
            saveSessionId(data.session_id)
            return true
        } catch (err) {
            console.error('Error:', err)
        } finally {
            loading.value = false
        }

        return false
    }

    return { logined, loading, username, sessionId, login, loadCurrentUser }
})