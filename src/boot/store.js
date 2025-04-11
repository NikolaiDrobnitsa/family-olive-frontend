// src/boot/store.js
import { boot } from 'quasar/wrappers'
import store from '../store'

export default boot(({ app }) => {
  // Регистрируем хранилище Vuex в приложении
  app.use(store)
})
