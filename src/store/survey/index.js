// src/store/survey/index.js
import { api } from 'boot/axios'

const state = {
  completed: false,
  questions: [],
  userResponses: [],
  loading: false
}

const getters = {
  hasCompletedSurvey: state => state.completed
}

const mutations = {
  SET_COMPLETED(state, completed) {
    state.completed = completed
  },

  SET_QUESTIONS(state, questions) {
    state.questions = questions
  },

  SET_USER_RESPONSES(state, responses) {
    state.userResponses = responses
  },

  SET_LOADING(state, loading) {
    state.loading = loading
  }
}

const actions = {
  // Получение вопросов опроса
  async fetchQuestions({ commit }) {
    commit('SET_LOADING', true)

    try {
      const response = await api.get('/api/survey/questions')

      if (response.data.success) {
        commit('SET_QUESTIONS', response.data.questions)
      }

      return response.data.questions
    } catch (error) {
      console.error('Ошибка при загрузке вопросов:', error)
      return []
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Отправка ответов на опрос
  async submitResponses({ commit }, responses) {
    commit('SET_LOADING', true)

    try {
      const response = await api.post('/api/survey/responses', { responses })

      if (response.data.success) {
        commit('SET_COMPLETED', true)
      }

      return response.data
    } catch (error) {
      console.error('Ошибка при отправке ответов:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Получение ответов пользователя
  async fetchUserResponses({ commit }) {
    commit('SET_LOADING', true)

    try {
      const response = await api.get('/api/survey/user-responses')

      if (response.data.success) {
        commit('SET_USER_RESPONSES', response.data.responses)

        if (response.data.responses.length > 0) {
          commit('SET_COMPLETED', true)
        }
      }

      return response.data.responses
    } catch (error) {
      console.error('Ошибка при загрузке ответов пользователя:', error)
      return []
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Проверка статуса прохождения опроса
  async checkSurveyStatus({ commit }) {
    try {
      const response = await api.get('/api/survey/check')

      if (response.data.success) {
        commit('SET_COMPLETED', response.data.completed)
      }

      return response.data
    } catch (error) {
      console.error('Ошибка при проверке статуса опроса:', error)
      return { completed: false }
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
