// src/store/events/index.js
import { api } from 'src/boot/axios'

const state = {
  events: [],
  eventsByCategory: {
    '20ha': [],
    '5ha_cottage': []
  },
  loading: false
}

const getters = {
  getEventsByCategory: state => category => {
    if (category === 'all') return state.events
    return state.eventsByCategory[category] || []
  }
}

const mutations = {
  SET_EVENTS(state, events) {
    state.events = events
  },

  SET_EVENTS_BY_CATEGORY(state, { category, events }) {
    state.eventsByCategory[category] = events
  },

  SET_LOADING(state, loading) {
    state.loading = loading
  }
}

const actions = {
  // Получение всех событий
  async fetchEvents({ commit }) {
    commit('SET_LOADING', true)

    try {
      const response = await api.get('/api/events')

      if (response.data.success) {
        commit('SET_EVENTS', response.data.events)
      }

      return response.data.events
    } catch (error) {
      console.error('Ошибка при загрузке событий:', error)
      return []
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Получение событий по категории
  async fetchEventsByCategory({ commit }, category) {
    commit('SET_LOADING', true)

    try {
      const response = await api.get(`/api/events/${category}`)

      if (response.data.success) {
        commit('SET_EVENTS_BY_CATEGORY', { category, events: response.data.events })
      }

      return response.data.events
    } catch (error) {
      console.error(`Ошибка при загрузке событий для категории ${category}:`, error)
      return []
    } finally {
      commit('SET_LOADING', false)
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
