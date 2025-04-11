// src/store/auth/index.js
import { api } from 'boot/axios'
import { LocalStorage } from 'quasar'
import jwt_decode from 'jwt-decode'

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
  async login({ commit }, formData) {
    try {
      const response = await api.post('/api/auth/login', formData)

      if (response.data.success && response.data.verified) {
        commit('SET_TOKEN', response.data.token)
        commit('SET_USER', response.data.user)
      }

      return response.data
    } catch (error) {
      throw error
    }
  },

  // Верификация кода
  async verifyCode({ commit }, { email, code }) {
    try {
      const response = await api.post('/api/auth/verify', { email, code })

      if (response.data.success) {
        commit('SET_TOKEN', response.data.token)
        commit('SET_USER', response.data.user)
        commit('SET_PENDING_EMAIL', null)
        commit('SET_VERIFICATION_NEEDED', false)
      }

      return response.data
    } catch (error) {
      throw error
    }
  },

  // Повторная отправка кода
  async resendCode({ commit }, { email }) {
    try {
      const response = await api.post('/api/auth/resend-code', { email })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Выход из системы
  async logout({ commit }) {
    try {
      await api.post('/api/logout')
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error)
    } finally {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
    }
  },

  // Проверка статуса аутентификации
  async checkAuth({ commit, state }) {
    if (!state.token) return { authenticated: false }

    try {
      const response = await api.get('/api/auth/check')

      if (response.data.authenticated) {
        commit('SET_USER', response.data.user)
        return { authenticated: true, user: response.data.user }
      } else {
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
        return { authenticated: false }
      }
    } catch (error) {
      console.error('Ошибка при проверке аутентификации:', error)
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
      return { authenticated: false }
    }
  },

  // Инициализация состояния аутентификации при загрузке приложения
  init({ commit, dispatch, state }) {
    const token = state.token

    if (token) {
      try {
        // Проверяем, не истек ли токен (если используется JWT)
        if (token.includes('.')) {
          try {
            const decoded = jwt_decode(token)
            const currentTime = Date.now() / 1000

            if (decoded.exp < currentTime) {
              // Если токен истек, очищаем состояние
              commit('SET_TOKEN', null)
              commit('SET_USER', null)
              return
            }
          } catch (e) {
            // Если токен не является JWT или произошла ошибка декодирования
            console.error('Ошибка декодирования токена:', e)
          }
        }

        // Проверяем аутентификацию
        dispatch('checkAuth')
      } catch (error) {
        console.error('Ошибка при инициализации аутентификации:', error)
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
      }
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
