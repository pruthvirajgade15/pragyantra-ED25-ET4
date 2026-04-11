
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (email, password) => api.post('/auth/login',
    new URLSearchParams({ username: email, password }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  ),
  me: () => api.get('/auth/me'),
}

export const scholarshipAPI = {
  list:    (params) => api.get('/scholarships', { params }),
  matched: ()       => api.get('/scholarships/matched'),
  get:     (id)     => api.get(`/scholarships/${id}`),
  save:    (id, score) => api.post('/scholarships/save', { scholarship_id: id, match_score: score }),
  saved:   ()       => api.get('/scholarships/saved'),
  prioritize: ()    => api.get('/recommendations/prioritize'),
}

export const profileAPI = {
  get:  ()     => api.get('/profile'),
  save: (data) => api.post('/profile', data),
}

export const essayAPI = {
  generate: (data)     => api.post('/essays/generate', data),
  drafts:   ()         => api.get('/essays/drafts'),
  getDraft: (id)       => api.get(`/essays/drafts/${id}`),
  delete:   (id)       => api.delete(`/essays/drafts/${id}`),
}

export const deadlineAPI = {
  upcoming: () => api.get('/deadlines/upcoming'),
  summary:  () => api.get('/deadlines/summary'),
}

export const chatAPI = {
  ask: (message, history) => api.post('/chat/ask', { message, history }),
}

export default api