import { ref } from "vue"
import { defineStore } from "pinia"

const SESSIONID_LOCAL_STORAGE_KEY = 'sessionId'

function saveSessionId(sessionId: string) {
    localStorage.setItem(SESSIONID_LOCAL_STORAGE_KEY, sessionId)
}

function loadSessionId(): string | null {
    return localStorage.getItem(SESSIONID_LOCAL_STORAGE_KEY)
}

export const useUserStore = defineStore('user', () => {
    const storedSessionId = loadSessionId()
    const sessinLoaded = storedSessionId !== null

    const logined = ref(sessinLoaded)
    const loading = ref(false)
    const username = ref<string | null>(sessinLoaded ? "NOT_LOADED" : null)
    const sessionId = ref<string | null>(storedSessionId)

    async function login(user: string, password: string): Promise<boolean> {
        loading.value = true

        try {
            const response = await fetch(
                "http://localhost:8080/login",
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: user,
                        password: password
                    }),
                })

            if (response.status != 200) {
                console.error('Invalid response:', response)
                return false
            }

            const data = await response.json()

            username.value = data.user.Email
            logined.value = true
            sessionId.value = data.session_id
            saveSessionId(data.session_id)
            return true
        }
        catch (err) {
            console.error('Error:', err)
        }
        finally {
            loading.value = false
        }

        return false
    }

    return { logined, loading, username, sessionId, login }
})