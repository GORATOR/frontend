import { ref } from "vue"
import { defineStore } from "pinia"

const sleepNow = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

// TODO localstorage

export const useUserStore = defineStore('user', () => {
    const logined = ref(false)
    const loading = ref(false)
    const username = ref<string | null>(null)
    const sessionId = ref<string | null>(null)

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