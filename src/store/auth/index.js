// src/store/auth/index.js
import { api } from 'src/boot/axios'
import { LocalStorage } from 'quasar'

const state = {
  token: LocalStorage.getItem('token') || null,
  user: null,
  pendingEmail: null,
  verificationNeeded: false
}

const getters = {
  isAuthenticated: state => !!state.token,
  currentUser: state => state.user
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      LocalStorage.set('token', token)
    } else {
      LocalStorage.remove('token')
    }
  },

  SET_USER(state, user) {
    state.user = user
  },

  SET_PENDING_EMAIL(state, email) {
    state.pendingEmail = email
  },

  SET_VERIFICATION_NEEDED(state, needed) {
    state.verificationNeeded = needed
  }
}

const actions = {
  // Авторизация пользователя
  login({ commit }, formData) {
    return new Promise((resolve, reject) => {
      api.post('/api/auth/login', formData)
        .then(response => {
          if (response.data.success && response.data.verified) {
            commit('SET_TOKEN', response.data.token)
            commit('SET_USER', response.data.user)
          }
          resolve(response.data)
        })
        .catch(error => {
          console.error('Login error:', error)
          reject(error)
        })
    })
  },

  // Верификация кода
  verifyCode({ commit }, { email, code }) {
    return new Promise((resolve, reject) => {
      api.post('/api/auth/verify', { email, code })
        .then(response => {
          if (response.data.success) {
            commit('SET_TOKEN', response.data.token)
            commit('SET_USER', response.data.user)
            commit('SET_PENDING_EMAIL', null)
            commit('SET_VERIFICATION_NEEDED', false)
          }
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // Повторная отправка кода
  resendCode({ commit }, { email }) {
    return new Promise((resolve, reject) => {
      api.post('/api/auth/resend-code', { email })
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // Выход из системы
  logout({ commit }) {
    return new Promise((resolve, reject) => {
      api.post('/api/logout')
        .then(() => {
          commit('SET_TOKEN', null)
          commit('SET_USER', null)
          resolve()
        })
        .catch(error => {
          console.error('Logout error:', error)
          // Все равно очищаем состояние в случае ошибки
          commit('SET_TOKEN', null)
          commit('SET_USER', null)
          resolve() // Резолвим промис, чтобы не прерывать UI поток
        })
    })
  },

  // Проверка статуса аутентификации
  checkAuth({ commit, state }) {
    if (!state.token) return Promise.resolve({ authenticated: false })

    return new Promise((resolve, reject) => {
      api.get('/api/auth/check')
        .then(response => {
          if (response.data.authenticated) {
            commit('SET_USER', response.data.user)
            resolve({ authenticated: true, user: response.data.user })
          } else {
            commit('SET_TOKEN', null)
            commit('SET_USER', null)
            resolve({ authenticated: false })
          }
        })
        .catch(error => {
          console.error('Check auth error:', error)
          commit('SET_TOKEN', null)
          commit('SET_USER', null)
          resolve({ authenticated: false })
        })
    })
  },

  // Инициализация состояния аутентификации
  init({ commit, dispatch, state }) {
    const token = state.token

    if (token) {
      // Проверяем аутентификацию
      return dispatch('checkAuth')
    }

    return Promise.resolve()
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
