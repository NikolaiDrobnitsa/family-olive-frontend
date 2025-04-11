export default {
  namespaced: true,
  state: {
    token: null,
    user: null
  },
  getters: {
    isAuthenticated: state => !!state.token
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    }
  },
  actions: {
    init({ commit }) {
      console.log('Auth initialized')
      return Promise.resolve()
    }
  }
}
