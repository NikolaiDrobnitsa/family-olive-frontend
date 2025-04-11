// src/router/routes.js
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/Index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'questions',
        name: 'survey',
        component: () => import('pages/Survey.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('pages/Auth.vue'),
    meta: { guest: true }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
