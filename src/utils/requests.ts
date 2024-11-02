import { BASE_URL } from "../constants"
import { useUserStore } from '../store/user'

function sendPost(url: string, body: any): Promise<Response> {
    const auth = useUserStore()

    return fetch(
        BASE_URL + url,
        {
            method: 'POST',
            headers: auth.sessionId
                ? {
                    'Content-Type': 'application/json',
                    'X-Session-Id': `${auth.sessionId}`
                }
                : { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
}

export { sendPost }