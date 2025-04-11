// src/router/index.js
import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { LocalStorage } from 'quasar'

export default route(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Навигационный guard для проверки авторизации
  Router.beforeEach(async (to, from, next) => {
    const isAuthenticated = store.getters['auth/isAuthenticated']

    // Для защищенных маршрутов
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isAuthenticated) {
        // Если нет токена, перенаправляем на страницу авторизации
        next({ name: 'auth' })
      } else {
        // Проверяем актуальность сессии
        try {
          const authStatus = await store.dispatch('auth/checkAuth')
          if (authStatus.authenticated) {
            next()
          } else {
            next({ name: 'auth' })
          }
        } catch (error) {
          // В случае ошибки перенаправляем на авторизацию
          next({ name: 'auth' })
        }
      }
    }
    // Для гостевых маршрутов (если уже авторизован, перенаправляем на главную)
    else if (to.matched.some(record => record.meta.guest) && isAuthenticated) {
      next({ name: 'home' })
    }
    // Для всех остальных маршрутов
    else {
      next()
    }
  })

  return Router
})
