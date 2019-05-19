import firebase from '~/plugins/firebase.js'

export const state = () => ({
  user: null,
  isOpenAddListDialog: false,
  isOpenAddItemBottomSheet: false,
  isOpenNavigationDrawer: false,
})

export const getters = {
  user (state) {
    return state.user
  },
  isLogged (state) {
    return state.user !== null
  },
  isOpenAddListDialog (state) {
    return state.isOpenAddListDialog
  },
  isOpenAddItemBottomSheet (state) {
    return state.isOpenAddItemBottomSheet
  },
  isOpenNavigationDrawer (state) {
    return state.isOpenNavigationDrawer
  }
}

export const mutations = {
  setUser (state, user) {
    state.user = user
  },
  setIsOpenNavigationDrawer (state, is) {
    return state.isOpenNavigationDrawer = is
  },
  setIsOpenAddListDialog (state, is) {
    return state.isOpenAddListDialog = is
  },
  setIsOpenAddItemBottomSheet (state, is) {
    return state.isOpenAddItemBottomSheet = is
  },
}

export const actions = {
  login ({ commit }) {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithRedirect(provider)
  },
  setUser ({ commit }, user) {
    if (user) {
      commit('setUser', {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      })
    }
  },
  toggleNavigationDrawer ({ getters, commit }) {
    commit('setIsOpenNavigationDrawer', !getters.isOpenNavigationDrawer)
  },
  openNavigationDrawer ({ commit }) {
    commit('setIsOpenNavigationDrawer', true)
  },
  closeNavigationDrawer ({ commit }) {
    commit('setIsOpenNavigationDrawer', false)
  },
  openAddListDialog ({ commit }) {
    commit('setIsOpenAddListDialog', true)
  },
  closeAddListDialog ({ commit }) {
    commit('setIsOpenAddListDialog', false)
  },
  openAddItemBottomSheet({ commit }) {
    commit('setIsOpenAddItemBottomSheet', true)
  },
  closeAddItemBottomSheet({ commit }) {
    commit('setIsOpenAddItemBottomSheet', false)
  },
}