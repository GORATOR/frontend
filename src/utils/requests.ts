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

function sendPut(url: string, body: any): Promise<Response> {
    const auth = useUserStore();

    return fetch(
        BASE_URL + url,
        {
            method: 'PUT',
            headers: auth.sessionId
                ? {
                    'Content-Type': 'application/json',
                    'X-Session-Id': `${auth.sessionId}`
                }
                : { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
}

function sendGet(url: string): Promise<Response> {
    const auth = useUserStore()

    return fetch(
        BASE_URL + url,
        {
            method: 'GET',
            headers: auth.sessionId
                ? {
                    'Content-Type': 'application/json',
                    'X-Session-Id': `${auth.sessionId}`
                }
                : { 'Content-Type': 'application/json' }
        })
}

export { sendPost, sendGet, sendPut }