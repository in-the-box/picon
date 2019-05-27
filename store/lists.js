import { db } from '~/plugins/firebase'
import { firestoreAction } from 'vuexfire'
export const state = () => ({
  currentList: null,
  currentEntryId: null,
})

export const getters = {
  lists (state, _,rootState) {
    if (rootState.app.currentUser) {
      return rootState.app.currentUser.lists || []
    } else {
      return []
    }
  },
  currentList (state) {
    return state.currentList
  },
  currentListEntries (_, getters) {
    if (getters.currentList) {
      return getters.currentList.entries
    } else {
      return []
    }
  },
  currentListOpenEntries (_, getters) {
    return getters.currentListEntries.filter((entry) => {
      return !entry.isCompleted
    })
  },
  currentListClosedEntries (_, getters) {
    return getters.currentListEntries.filter((entry) => {
      return entry.isCompleted
    })
  },
  currentEntryId (state) {
    return state.currentEntryId
  },
  currentEntry (_, getters) {
    return getters.currentListEntries.find((item) => {
      return item.id === getters.currentEntryId
    })
  },
}

export const mutations = {
  setCurrentList (state, list) {
    state.currentList = list
  },
  setCurrentEntryId (state, id) {
    state.currentEntryId = id
  }
}

export const actions = {
  setEntryIsCompletedById (_, {entry, isCompleted}) {
    console.log(entry);
    return db.collection('entries').doc(entry.id).update({isCompleted})
  },
  async createList ({getters, rootGetters}, { name }) {
    const newList = await db.collection('lists').add({
      name,
      author: db.doc(`users/${rootGetters['app/currentUser'].id}`),
      entries: []
    })
    const userListRefs = getters.lists.map((list) => {
      return db.doc(`lists/${list.id}`)
    })
    await db.doc(`users/${rootGetters['app/currentUser'].id}`).update({
      lists: [
        ...userListRefs,
        newList
      ]``
    })
    return Promise.resolve(newList)
  },
  removeList (_, id) {
    return db.collection('lists').doc(id).delete()
  },
  leaveList ({ getters, rootGetters }, _list) {
    const listRefs = getters.lists
      .filter((list) => list.id !== _list.id )
      .map((list) => db.doc(`lists/${list.id}`))
    return db.doc(`users/${rootGetters['app/currentUser'].id}`).update({
      lists: listRefs
    })
  },
  setCurrentList ({commit, getters}, id) {
    return new Promise((resolve) => {
      const list = getters.lists.find((list) => list.id === id)
      if (list) {
        commit('setCurrentList', list)
        resolve(list)
      } else {
        db.collection('lists').doc(id).get().then((list) => {
          console.log(list.data());
        })
      }
    })
  },
  async createEntry ({ rootGetters }, { list, payload }) {
    const entry = await db.collection('entries').add({
      name: payload.name,
      author: db.doc(`users/${rootGetters['app/currentUser'].id}`),
      isCompleted: false,
      datatime: payload.datatime,
      assignee: payload.assignee,
      description: payload.description
    })
    return db.collection('lists').doc(list.id).update({
      entries: [
        entry,
        ...list.entries.map((entity) => db.doc(`entries/${entity.id}`)),
      ]
    })
  },
}