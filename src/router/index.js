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

  // Navigation guard for authentication and admin access
  Router.beforeEach((to, from, next) => {
    try {
      const isAuthenticated = store.getters && store.getters['auth/isAuthenticated']
      const isAdmin = store.getters && store.getters['auth/isAdmin']
      console.log('Route check:', {
        to: to.path,
        isAuthenticated,
        isAdmin,
        requiresAdmin: to.matched.some(record => record.meta.requiresAdmin)
      });
      // For routes requiring admin access
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        if (!isAuthenticated) {
          console.log('Redirecting to login: not authenticated');
          next({ name: 'admin-login' }); // Изменено с 'auth' на 'admin-login'
        } else if (!isAdmin) {
          console.log('Redirecting to home: not admin');
          next({ name: 'home' });
        } else {
          console.log('Proceeding to admin area');
          next();
        }
      }
      // For routes requiring just authentication
      else if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
          // If not authenticated, redirect to login
          next({ name: 'auth' })
        } else {
          next()
        }
      }
      // For guest routes (if already authenticated, redirect to home)
      else if (to.matched.some(record => record.meta.guest) && isAuthenticated) {
        next({ name: 'home' })
      }
      // For all other routes
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
