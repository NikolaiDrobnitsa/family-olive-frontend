// src/boot/axios.js
import axios from 'axios'
import { LocalStorage } from 'quasar'

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000
})

// Request interceptor
api.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = LocalStorage.getItem('token')

    // Make sure config object is properly initialized
    if (!config) {
      config = {}
    }

    // Make sure headers object exists
    if (!config.headers) {
      config.headers = {}
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      // Clear token on 401 Unauthorized
      LocalStorage.remove('token')
    }
    return Promise.reject(error)
  }
)

export { api }
