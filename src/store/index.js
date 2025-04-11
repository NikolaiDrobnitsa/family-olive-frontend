// src/store/index.js

import { createStore } from 'vuex'
import auth from './auth'
import survey from './survey'
import events from './events'
import admin from './admin'

// Создайте хранилище
const Store = createStore({
  modules: {
    auth,
    survey,
    events,
    admin
  },
  strict: process.env.DEV
})

// Инициализация аутентификации после создания хранилища
if (typeof window !== 'undefined') {
  Store.dispatch('auth/init').catch(error => {
    console.error('Error initializing auth:', error)
  })
}

export default Store
