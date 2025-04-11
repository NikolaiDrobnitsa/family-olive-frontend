// src/router/admin-routes.js
const adminRoutes = [
  {
    path: '/admin',
    component: () => import('src/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('src/pages/admin/Dashboard.vue'),
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('src/pages/admin/Users.vue'),
      },
      {
        path: 'users/:id',
        name: 'admin-user-details',
        component: () => import('src/pages/admin/UserDetail.vue'),
        props: true
      },
      {
        path: 'events',
        name: 'admin-events',
        component: () => import('src/pages/admin/Events.vue'),
      },
      {
        path: 'events/create',
        name: 'admin-event-create',
        component: () => import('src/pages/admin/EventForm.vue'),
      },
      {
        path: 'events/:id/edit',
        name: 'admin-event-edit',
        component: () => import('src/pages/admin/EventForm.vue'),
        props: true
      },
      {
        path: 'survey',
        name: 'admin-survey',
        component: () => import('src/pages/admin/Survey.vue'),
      },
      {
        path: 'survey/create',
        name: 'admin-survey-create',
        component: () => import('src/pages/admin/SurveyForm.vue'),
      },
      {
        path: 'survey/:id/edit',
        name: 'admin-survey-edit',
        component: () => import('src/pages/admin/SurveyForm.vue'),
        props: true
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('src/pages/admin/Settings.vue'),
      }
    ]
  }
]

export default adminRoutes
