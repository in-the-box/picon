import auth from '~/plugins/auth'
export default async function ({ store, route, redirect }) {
  return new Promise (async (resolve) => {
    const user = await auth()
    store.dispatch('app/setUser', user)
    if (!store.getters['app/isLogged'] && route.path !== '/login') {
      redirect('/login')
    }
    if (store.getters['app/isLogged'] && route.path === '/login') {
      redirect('/')
    }
    resolve()
  })
}