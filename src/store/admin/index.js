// src/store/admin/index.js
import { api } from 'src/boot/axios'

const state = {
  // Дашборд
  dashboard: {
    totalUsers: 0,
    verifiedUsers: 0,
    totalEvents: 0,
    surveyCompleted: 0,
    usersByDate: []
  },
  // Пользователи
  users: [],
  usersPagination: {
    page: 1,
    total: 0,
    perPage: 15
  },
  userFilters: {},
  selectedUser: null,
  userResponses: [],
  // События
  events: [],
  selectedEvent: null,
  // Опросник
  questions: [],
  selectedQuestion: null,
  // Настройки
  settings: {},
  admins: [],
  loading: false
}

const getters = {
  // Дашборд
  dashboardStats: state => state.dashboard,

  // Пользователи
  usersList: state => state.users,
  usersPagination: state => state.usersPagination,
  selectedUser: state => state.selectedUser,
  userResponses: state => state.userResponses,

  // События
  eventsList: state => state.events,
  selectedEvent: state => state.selectedEvent,

  // Опросник
  questionsList: state => state.questions,
  selectedQuestion: state => state.selectedQuestion,

  // Настройки
  settingsList: state => state.settings,
  adminsList: state => state.admins,

  // Общее
  isLoading: state => state.loading
}

const mutations = {
  // Дашборд
  SET_DASHBOARD_STATS(state, stats) {
    state.dashboard = stats
  },

  // Пользователи
  SET_USERS(state, { users, pagination }) {
    state.users = users
    if (pagination) {
      state.usersPagination = pagination
    }
  },

  SET_USER_FILTERS(state, filters) {
    state.userFilters = filters
  },

  SET_SELECTED_USER(state, user) {
    state.selectedUser = user
  },

  SET_USER_RESPONSES(state, responses) {
    state.userResponses = responses
  },

  // События
  SET_EVENTS(state, events) {
    state.events = events
  },

  SET_SELECTED_EVENT(state, event) {
    state.selectedEvent = event
  },

  ADD_EVENT(state, event) {
    state.events.push(event)
  },

  UPDATE_EVENT(state, updatedEvent) {
    const index = state.events.findIndex(e => e.id === updatedEvent.id)
    if (index !== -1) {
      state.events.splice(index, 1, updatedEvent)
    }
  },

  REMOVE_EVENT(state, eventId) {
    state.events = state.events.filter(e => e.id !== eventId)
  },

  // Опросник
  SET_QUESTIONS(state, questions) {
    state.questions = questions
  },

  SET_SELECTED_QUESTION(state, question) {
    state.selectedQuestion = question
  },

  ADD_QUESTION(state, question) {
    state.questions.push(question)
  },

  UPDATE_QUESTION(state, updatedQuestion) {
    const index = state.questions.findIndex(q => q.id === updatedQuestion.id)
    if (index !== -1) {
      state.questions.splice(index, 1, updatedQuestion)
    }
  },

  REMOVE_QUESTION(state, questionId) {
    state.questions = state.questions.filter(q => q.id !== questionId)
  },

  // Настройки
  SET_SETTINGS(state, settings) {
    state.settings = settings
  },

  SET_ADMINS(state, admins) {
    state.admins = admins
  },

  ADD_ADMIN(state, admin) {
    state.admins.push(admin)
  },

  REMOVE_ADMIN(state, adminId) {
    state.admins = state.admins.filter(a => a.id !== adminId)
  },

  // Общее
  SET_LOADING(state, loading) {
    state.loading = loading
  }
}

const actions = {
  // Дашборд
  async fetchDashboardStats({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get('/api/admin/dashboard')
      commit('SET_DASHBOARD_STATS', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Пользователи
  async fetchUsers({ commit, state }, { page = 1, filters = {} } = {}) {
    commit('SET_LOADING', true)
    try {
      let url = `/api/admin/users?page=${page}`

      // Добавляем фильтры к URL, если они есть
      if (filters.email) url += `&email=${filters.email}`
      if (filters.phone) url += `&phone=${filters.phone}`
      if (filters.is_verified !== undefined) url += `&is_verified=${filters.is_verified}`
      if (filters.interest_type) url += `&interest_type=${filters.interest_type}`
      if (filters.date_from) url += `&date_from=${filters.date_from}`
      if (filters.date_to) url += `&date_to=${filters.date_to}`
      if (filters.utm_source) url += `&utm_source=${filters.utm_source}`

      const response = await api.get(url)

      // Предполагаем, что API возвращает { data: [...], meta: { total, per_page, current_page } }
      const users = response.data.data || []
      const pagination = {
        page: response.data.meta?.current_page || 1,
        total: response.data.meta?.total || 0,
        perPage: response.data.meta?.per_page || 15
      }

      commit('SET_USERS', { users, pagination })
      commit('SET_USER_FILTERS', filters)

      return users
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchUser({ commit }, userId) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get(`/api/admin/users/${userId}`)
      commit('SET_SELECTED_USER', response.data)
      return response.data
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchUserResponses({ commit }, userId) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get(`/api/admin/users/${userId}/survey-responses`)
      commit('SET_USER_RESPONSES', response.data.responses)
      return response.data.responses
    } catch (error) {
      console.error(`Error fetching responses for user ${userId}:`, error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteUser({ commit }, userId) {
    commit('SET_LOADING', true)
    try {
      await api.delete(`/api/admin/users/${userId}`)
      // После успешного удаления обновляем список пользователей
      return { success: true }
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // События
  async fetchEvents({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get('/api/admin/events')
      commit('SET_EVENTS', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching events:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchEvent({ commit }, eventId) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get(`/api/admin/events/${eventId}`)
      commit('SET_SELECTED_EVENT', response.data)
      return response.data
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createEvent({ commit }, eventData) {
    commit('SET_LOADING', true)
    try {
      // Для отправки файлов используем FormData
      const formData = new FormData()

      // Добавляем текстовые поля
      for (const key in eventData) {
        if (key !== 'image' || !eventData[key]) {
          formData.append(key, eventData[key])
        }
      }

      // Добавляем изображение, если оно есть
      if (eventData.image instanceof File) {
        formData.append('image', eventData.image)
      }

      const response = await api.post('/api/admin/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      commit('ADD_EVENT', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateEvent({ commit }, { eventId, eventData }) {
    commit('SET_LOADING', true)
    try {
      // Для отправки файлов используем FormData
      const formData = new FormData()

      // Добавляем метод _method=PUT для симуляции PUT-запроса с FormData
      formData.append('_method', 'PUT')

      // Добавляем текстовые поля
      for (const key in eventData) {
        if (key !== 'image' || !eventData[key]) {
          formData.append(key, eventData[key])
        }
      }

      // Добавляем изображение, если оно есть
      if (eventData.image instanceof File) {
        formData.append('image', eventData.image)
      }

      const response = await api.post(`/api/admin/events/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      commit('UPDATE_EVENT', response.data)
      return response.data
    } catch (error) {
      console.error(`Error updating event ${eventId}:`, error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteEvent({ commit }, eventId) {
    commit('SET_LOADING', true)
    try {
      await api.delete(`/api/admin/events/${eventId}`)
      commit('REMOVE_EVENT', eventId)
      return { success: true }
    } catch (error) {
      console.error(`Error deleting event ${eventId}:`, error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateEventsOrder({ commit }, events) {
    commit('SET_LOADING', true)
    try {
      await api.post('/api/admin/events/order', { events })
      return { success: true }
    } catch (error) {
      console.error('Error updating events order:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Опросник
  async fetchQuestions({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get('/api/admin/survey')
      commit('SET_QUESTIONS', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching questions:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchQuestion({ commit }, questionId) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get(`/api/admin/survey/${questionId}`)
      commit('SET_SELECTED_QUESTION', response.data)
      return response.data
    } catch (error) {
      console.error(`Error fetching question ${questionId}:`, error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createQuestion({ commit }, questionData) {
    commit('SET_LOADING', true)
    try {
      const response = await api.post('/api/admin/survey', questionData)
      commit('ADD_QUESTION', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating question:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateQuestion({ commit }, { questionId, questionData }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.put(`/api/admin/survey/${questionId}`, questionData)
      commit('UPDATE_QUESTION', response.data)
      return response.data
    } catch (error) {
      console.error(`Error updating question ${questionId}:`, error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteQuestion({ commit }, questionId) {
    commit('SET_LOADING', true)
    try {
      await api.delete(`/api/admin/survey/${questionId}`)
      commit('REMOVE_QUESTION', questionId)
      return { success: true }
    } catch (error) {
      console.error(`Error deleting question ${questionId}:`, error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateQuestionsOrder({ commit }, questions) {
    commit('SET_LOADING', true)
    try {
      await api.post('/api/admin/survey/order', { questions })
      return { success: true }
    } catch (error) {
      console.error('Error updating questions order:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Настройки
  async fetchSettings({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get('/api/admin/settings')
      commit('SET_SETTINGS', response.data.settings)
      commit('SET_ADMINS', response.data.admins)
      return response.data
    } catch (error) {
      console.error('Error fetching settings:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateSettings({ commit }, settings) {
    commit('SET_LOADING', true)
    try {
      const response = await api.post('/api/admin/settings', { settings })
      commit('SET_SETTINGS', response.data.settings)
      return response.data
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async changePassword({ commit }, passwordData) {
    commit('SET_LOADING', true)
    try {
      const response = await api.post('/api/admin/settings/password', passwordData)
      return response.data
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createAdmin({ commit }, adminData) {
    commit('SET_LOADING', true)
    try {
      const response = await api.post('/api/admin/settings/admin', adminData)
      commit('ADD_ADMIN', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating admin:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteAdmin({ commit }, adminId) {
    commit('SET_LOADING', true)
    try {
      await api.delete(`/api/admin/settings/admin/${adminId}`)
      commit('REMOVE_ADMIN', adminId)
      return { success: true }
    } catch (error) {
      console.error(`Error deleting admin ${adminId}:`, error)
      throw error
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
