<template>

  <div class="modal fade" :id="id" tabindex="-1" role="dialog" aria-hidden="true" ref="modal">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-body text-center p-4">

          <p class="lead" v-text="introText"></p>
          <p v-text="gettext(`The allocator creates stronger panels for debates that were given
                              higher importances. If importances have not been set it will allocate
                              stronger panels to debates in a higher bracket.`)"></p>
          <p>
            Adjudicators must have a feedback score over <strong>{{ extra.scoreForVote }}
            </strong>to panel. You can change this in the <em>Draw Rules</em> section of
            Configuration if needed. Try modifying this value if you are seeing too few or too many
            panellists being allocated.
          </p>
          <div v-if="extra.scoreForVote > extra.scoreMax" class="alert alert-warning">
            The score required to panel ({{ extra.scoreForVote }}) is higher than the maximum
            adjudicator score ({{ extra.scoreMax }}). You should probably lower the score
            required to panel in settings.
          </div>
          <div v-if="extra.scoreForVote < extra.scoreMin" class="alert alert-warning">
            The score required to panel ({{ extra.scoreForVote }}) is lower than the minimum
            adjudicator score ({{ extra.scoreMin }}). You should probably raise the score
            required to panel in settings.
          </div>

          <button type="submit" @click="performWSAction"
                  :class="['btn btn-block btn-success', loading ? 'disabled': '']"
                  v-text="loading ? gettext('Loading...') : gettext('Auto-Allocate')"></button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import { mapState } from 'vuex'

import ModalActionMixin from './ModalActionMixin.vue'

export default {
  mixins: [ModalActionMixin],
  props: { introText: String },
  data: function () {
    // Internal state storing the status of which diversity highlight is being toggled
    return {
      id: 'confirmAllocateModal',
    }
  },
  computed: mapState(['extra']),
}
</script>
