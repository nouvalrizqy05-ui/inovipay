import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach token dari localStorage ke setiap request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Hanya redirect ke login jika token benar-benar expired/invalid
// TIDAK akan auto-logout saat browser ditutup atau network error
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Hanya force-logout jika server secara eksplisit menolak token (401)
    // DAN bukan karena network error (err.response ada)
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname
      // Hanya redirect jika sedang di halaman yang butuh auth (reseller/admin)
      // dan BUKAN di halaman auth itu sendiri
      if ((path.startsWith('/reseller') || path.startsWith('/admin')) && !path.startsWith('/auth')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
