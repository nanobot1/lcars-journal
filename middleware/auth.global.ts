export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn } = useUserSession()

  // If not logged in and not going to login page, redirect to login
  if (!loggedIn.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // If logged in and going to login page, redirect to home
  if (loggedIn.value && to.path === '/login') {
    return navigateTo('/')
  }
})
