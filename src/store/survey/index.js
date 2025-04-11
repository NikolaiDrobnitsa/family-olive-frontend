export default {
  namespaced: true,
  state: {
    completed: false
  },
  mutations: {
    SET_COMPLETED(state, completed) {
      state.completed = completed
    }
  }
}
