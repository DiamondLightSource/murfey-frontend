export const logout = () => {
  // Clear all cookies, then redirect to the logout page
  sessionStorage.clear()
  localStorage.clear()
  window.location.href = '/sign_out'
}
