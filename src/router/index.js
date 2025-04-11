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
  Router.beforeEach(async (to, from, next) => {
    const isAuthenticated = store.getters['auth/isAuthenticated'];
    const isAdmin = store.getters['auth/isAdmin']; // Добавим этот геттер в store

    // Для защищенных маршрутов админ-панели
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (!isAuthenticated) {
        return next({ name: 'auth' });
      }

      try {
        const authStatus = await store.dispatch('auth/checkAuth');
        if (authStatus.authenticated && authStatus.user.is_admin) {
          next();
        } else {
          // Если пользователь не админ, перенаправляем на главную
          next({ name: 'home' });
        }
      } catch (error) {
        next({ name: 'auth' });
      }
    }
    // Для обычных защищенных маршрутов
    else if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isAuthenticated) {
        next({ name: 'auth' });
      } else {
        try {
          const authStatus = await store.dispatch('auth/checkAuth');
          if (authStatus.authenticated) {
            next();
          } else {
            next({ name: 'auth' });
          }
        } catch (error) {
          next({ name: 'auth' });
        }
      }
    }
    // Для гостевых маршрутов
    else if (to.matched.some(record => record.meta.guest) && isAuthenticated) {
      // Если пользователь авторизован и является админом, перенаправляем в админку
      if (isAdmin) {
        next({ name: 'admin.dashboard' });
      } else {
        // Обычных пользователей - на главную
        next({ name: 'home' });
      }
    }
    // Для всех остальных маршрутов
    else {
      next();
    }
  });

  return Router
})
