<template>

  <div class="d-flex flex-fill align-items-stretch align-items-center">
    <div class="p-2 d-flex align-items-center">
      <i data-feather="move"></i>
    </div>
    <div class="d-flex vc-chair-flex flex-truncate flex-nowrap border-left">
      <droppable-item class="d-flex flex-grow-1" :handle-drop="handleDebateOrPanelDrop"
                      :drop-context="{ assignment: debateOrPanel.id, position: 'C'}">
        <div :class="['align-items-center flex-fill', chairID ? 'd-none' : 'd-flex']">
          <div class="mx-auto py-2 px-3">ⓒ</div>
        </div>
        <draggable-adjudicator v-if="chairID" class="flex-fill" :item="allAdjudicators[chairID]"
                               :drag-payload="getDragPayload(chairID, 'C')"
                               style="max-width: 160px">
        </draggable-adjudicator>
      </droppable-item>
    </div>
    <div class="d-flex flex-grow-1 border-left">
      <droppable-item class="d-flex flex-grow-1 flex-wrap" :handle-drop="handleDebateOrPanelDrop"
                      :drop-context="{ assignment: debateOrPanel.id, position: 'P'}">
        <draggable-adjudicator v-for="adjID in adjudicators.P" :item="allAdjudicators[adjID]"
                               :drag-payload="getDragPayload(adjID, 'P')" :key="adjID">
        </draggable-adjudicator>
      </droppable-item>
    </div>
    <div class="d-flex flex-shrink-1 border-left">
      <droppable-item class="d-flex flex-grow-1 flex-wrap" :handle-drop="handleDebateOrPanelDrop"
                      :drop-context="{ assignment: debateOrPanel.id, position: 'T'}">
        <div :class="['align-items-center flex-fill', adjudicators.T.length > 0 ? 'd-none' : 'd-flex']">
          <div class="mx-auto py-2 px-4">ⓣ</div>
        </div>
        <draggable-adjudicator v-for="adjID in adjudicators.T" :item="allAdjudicators[adjID]"
                               :drag-payload="getDragPayload(adjID, 'T')" :key="adjID"
                               :isTrainee="true">
        </draggable-adjudicator>
      </droppable-item>
    </div>
  </div>

</template>

<script>
import DroppableItem from '../../utils/templates/DroppableItem.vue'
import DraggableAdjudicator from './DraggableAdjudicator.vue'

export default {
  components: { DraggableAdjudicator, DroppableItem },
  props: [ 'debateOrPanel', 'handleDebateOrPanelDrop' ],
  computed: {
    chairID () {
      return this.adjudicators.C[0]
    },
    allAdjudicators () {
      return this.$store.getters.allocatableItems
    },
    adjudicators () {
      return this.debateOrPanel.adjudicators
    },
  },
  methods: {
    getDragPayload: function (adjID, position) {
      return {
        'item': adjID,
        'assignment': this.debateOrPanel.id,
        'position': position,
      }
    },
    handledrop: function (droppedData) {
      console.log('handledrop', droppedData)
      // Emit the 'send adj to this debate method'
    },
  },
}
</script>

<style scoped>
  .vc-chair-flex {
    flex: 0 0 168px; /* Don't grow or shrink; remain at fixed width (must match style on chair) */
  }
</style>
