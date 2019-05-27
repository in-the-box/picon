import { db } from '~/plugins/firebase'
import { firestoreAction } from 'vuexfire'
export const state = () => ({
  currentListId: null,
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
  currentListId (state) {
    return state.currentListId
  },
  currentList (state, getters) {
    return getters.lists.find((item) => {
      return item.id === getters.currentListId
    })
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
  setCurrentListId (state, id) {
    state.currentListId = id
  },
  setCurrentEntryId (state, id) {
    state.currentEntryId = id
  }
}

export const actions = {
  setEntryIsCompletedById (_, {id, is}) {
    return db.collection('entries').doc(id).update({isCompleted: is})
  },
  createList ({getters, rootGetters}, { name }) {
    db.collection('lists').add({
      name,
      author: db.doc(`users/${rootGetters['app/currentUser'].id}`),
      entries: []
    }).then((ref) => {
      const listRef = db.doc(`lists/${ref.id}`)
      const userListRefs = getters.lists.map((list) => {
        return db.doc(`lists/${list.id}`)
      })
      db.doc(`users/${rootGetters['app/currentUser'].id}`).update({
        lists: [
          ...userListRefs,
          listRef
        ]
      })
    })
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
  setCurrentList ({commit}, id) {
    commit('setCurrentListId', id)
  },
  setCurrentEntryId ({commit}, id) {
    commit('setCurrentEntryId', id)
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
  }
}