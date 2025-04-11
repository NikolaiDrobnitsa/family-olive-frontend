import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// const api = axios.create({ baseURL: 'https://api.example.com' })
const api = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true // Важно для работы с sanctum и session cookies
})
export default defineBoot(({ app, store, router }) => {
  // Настройка перехватчика запросов для обработки ошибок аутентификации
  api.interceptors.response.use(
    response => response,
    error => {
      // Если 401 - пользователь не авторизован
      if (error.response && error.response.status === 401) {
        if (store.getters['auth/isAuthenticated']) {
          // Разлогиниваем пользователя
          store.dispatch('auth/logout')
            .then(() => {
              Notify.create({
                type: 'negative',
                message: 'Сессия истекла. Пожалуйста, войдите снова.',
                position: 'top'
              })
              router.push('/auth')
            })
        }
      }

      // Если 422 - ошибка валидации
      if (error.response && error.response.status === 422) {
        let errorMessage = 'Ошибка валидации данных'

        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        }

        Notify.create({
          type: 'negative',
          message: errorMessage,
          position: 'top'
        })
      }

      return Promise.reject(error)
    }
  )

  // Настройка перехватчика запросов для добавления токена авторизации
  api.interceptors.request.use(
    config => {
      const token = store.state.auth.token

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // Добавляем экземпляр axios в Vue
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
