import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

// The Vuex data store that contains the list of debates that are mutated
// and updated through websockets
export default new Vuex.Store({
  state: {
    debatesOrPanels: {}, // Keyed by primary key
    allocatableItems: {}, // Keyed by primary key
    extra: {},
    highlights: {},
    institutions: {},
    regions: {},
    loading: false, // Used by modal windows when waiting for an allocation etc
    round: null,
    tournament: null,
    // For saving mechanisms
    wsBridge: null,
    wsPseudoComponentID: null,
    lastSaved: null,
  },
  mutations: {
    setupInitialData (state, initialData) {
      // Set primary data across all drag and drop views
      let loadDirectFromKey = ['round', 'tournament', 'extra']
      loadDirectFromKey.forEach((key) => {
        state[key] = initialData[key]
      })
      let LoadKeyedAsDictionary = ['debatesOrPanels', 'institutions', 'allocatableItems']
      LoadKeyedAsDictionary.forEach((key) => {
        initialData[key].forEach((item) => {
          state[key][item.id] = item // Load array in as id-key dictionary
        })
      })
      // Set Highlights
      Object.entries(initialData.extra.highlights).forEach(([key, value]) => {
        Vue.set(state.highlights, key, { active: false, options: {} })
        value.forEach((item, index) => {
          item.css = key + '-display ' + key + '-' + index
          state.highlights[key].options[item.id] = item
        })
      })
    },
    setupWebsocketBridge (state, bridge) {
      state.wsBridge = bridge // Load websocket into store for universal access
      state.wsPseudoComponentID = Math.floor(Math.random() * 10000)
    },
    setDebateOrPanelAttributes (state, changes) {
      // For a given set of debates or panels update their attribute values
      changes.forEach((debateOrPanel) => {
        if (state.debatesOrPanels[debateOrPanel.id]) {
          Object.entries(debateOrPanel).forEach(([key, value]) => {
            if (key !== 'id') {
              state.debatesOrPanels[debateOrPanel.id][key] = value
            }
          })
        } else {
          // We can receive entirely new debates; i.e. from create panels or
          // if the draw is edited and then an allocation runs
          Vue.set(state.debatesOrPanels, debateOrPanel.id, debateOrPanel)
        }
      })
    },
    setAllocatableAttributes (state, changes) {
      changes.forEach((allocatableItem) => {
        if (state.allocatableItems[allocatableItem.id]) {
          Object.entries(allocatableItem).forEach(([key, value]) => {
            if (key !== 'id') {
              state.allocatableItems[allocatableItem.id][key] = value
            }
          })
        }
      })
    },
    toggleHighlight (state, type) {
      Object.entries(state.highlights).forEach(([key, value]) => {
        if (key !== type) {
          value.active = false
        }
      })
      state.highlights[type].active = !state.highlights[type].active
    },
    updateSaveCounter (state) {
      state.lastSaved = new Date()
    },
    setLoadingState (state, isLoading) {
      state.loading = isLoading
    },
  },
  getters: {
    allDebatesOrPanels: state => {
      return state.debatesOrPanels
    },
    allocatableItems: state => {
      return state.allocatableItems
    },
    loadingState: state => {
      return state.loading
    },
  },
  // Note actions are async
  actions: {
    updateDebatesOrPanelsAttribute ({ commit }, updatedDebatesOrPanels) {
      // Mutate debate/panel state to reflect the sent attributes via data like:
      // { attributeKey: [{ id: debateID, attributeKey: attributeValue ], ... }
      Object.entries(updatedDebatesOrPanels).forEach(([attribute, changes]) => {
        commit('setDebateOrPanelAttributes', changes)
      })
      // Send the result over the websocket, like:
      // "importance": [{ "id": 71, "importance": "0"} ], "componentID": 1407 }
      updatedDebatesOrPanels['componentID'] = this.state.wsPseudoComponentID
      this.state.wsBridge.send(updatedDebatesOrPanels)
      commit('updateSaveCounter')
      // TODO: error handling; locking; checking if the result matches sent data
    },
    updateAllocableItemModified ({ commit }, unallocatedItemIDs) {
      // To preserve the 'drag order' on the unallocated item we need to set the
      // modified attribute to be the current date time
      var changes = []
      const now = Math.round((new Date()).getTime() / 1000) // Unix time
      unallocatedItemIDs.forEach((id) => {
        changes.push({ 'id': id, 'vue_last_modified': now })
      })
      commit('setAllocatableAttributes', changes)
    },
    receiveUpdatedupdateDebatesOrPanelsAttribute ({ commit }, payload) {
      // Commit changes from websockets i.e.
      // { "componentID": 5711, "debatesOrPanels": [{ "id": 72, "importance": "0" }] }
      if ('message' in payload) {
        $.fn.showAlert(payload.message.type, payload.message.text, 0)
        commit('setLoadingState', false) // Hide and re-enable modals
      }
      // Don't update the data if it came from this store as it's mutated
      if (payload.componentID !== this.state.wsPseudoComponentID) {
        commit('setDebateOrPanelAttributes', payload.debatesOrPanels)
      }
    },
  },
  strict: debug,
})
