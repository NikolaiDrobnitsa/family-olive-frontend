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

  // Добавляем маршруты для админ-панели
  {
    path: '/admin',
    component: () => import('src/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin.dashboard',
        component: () => import('src/pages/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'admin.users',
        component: () => import('src/pages/admin/Users.vue')
      },
      {
        path: 'users/:id',
        name: 'admin.users.show',
        component: () => import('src/pages/admin/UserDetail.vue'),
        props: true
      },
      {
        path: 'events',
        name: 'admin.events',
        component: () => import('src/pages/admin/Events.vue')
      },
      // {
      //   path: 'events/create',
      //   name: 'admin.events.create',
      //   component: () => import('src/pages/admin/EventForm.vue')
      // },
      // {
      //   path: 'events/:id/edit',
      //   name: 'admin.events.edit',
      //   component: () => import('src/pages/admin/EventForm.vue'),
      //   props: true
      // },
      {
        path: 'survey',
        name: 'admin.survey',
        component: () => import('src/pages/admin/Survey.vue')
      },
      // {
      //   path: 'survey/create',
      //   name: 'admin.survey.create',
      //   component: () => import('src/pages/admin/SurveyForm.vue')
      // },
      // {
      //   path: 'survey/:id/edit',
      //   name: 'admin.survey.edit',
      //   component: () => import('src/pages/admin/SurveyForm.vue'),
      //   props: true
      // },
      // {
      //   path: 'settings',
      //   name: 'admin.settings',
      //   component: () => import('src/pages/admin/Settings.vue')
      // }
    ]
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/Error404.vue')
  }
]

export default routes
