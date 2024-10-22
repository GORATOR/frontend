import { createI18n } from "vue-i18n"

const i18n = createI18n({
    locale: 'ru',
    fallbackLocale: 'en',
    messages: {
        ru: {
            login: {
                login_field: 'Логин',
                password_field: 'Пароль',
                submit: 'Войти'
            }
        },
        en: {
            login: {
                login_field: 'Login',
                password_field: 'Password',
                submit: 'Login'
            }
        },
    }
})

export { i18n }