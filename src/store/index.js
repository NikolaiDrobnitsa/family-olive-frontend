// src/store/index.js
import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

import auth from './auth'
import survey from './survey'
import events from './events'

export default store(function () {
  const Store = createStore({
    modules: {
      auth,
      survey,
      events
    },

    strict: process.env.DEBUGGING
  })

  // Инициализация аутентификации при запуске приложения
  Store.dispatch('auth/init')

  return Store
})
