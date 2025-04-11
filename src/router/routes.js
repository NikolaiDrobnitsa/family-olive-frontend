// src/router/routes.js
const routes = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('src/pages/Index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'questions',
        name: 'survey',
        component: () => import('src/pages/Survey.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('src/pages/Auth.vue'),
    meta: { guest: true }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/Error404.vue')
  }
]

export default routes
