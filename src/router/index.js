// src/router/index.js
import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import store from '../store'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Навигационный guard для проверки авторизации
  Router.beforeEach((to, from, next) => {
    try {
      // Используем импортированное хранилище, а не то, что приходит в параметрах
      const isAuthenticated = store.getters && store.getters['auth/isAuthenticated']

      // Для защищенных маршрутов
      if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
          // Если нет токена, перенаправляем на страницу авторизации
          next({ name: 'auth' })
        } else {
          next()
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
    } catch (error) {
      console.error('Error in navigation guard:', error)
      next()
    }
  })

  return Router
})
