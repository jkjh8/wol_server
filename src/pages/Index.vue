<template>
  <div style="padding: 10% 10%; height: 100%">
    <div class="row justify-between items-center">
      <div class="row items-center">
        <q-icon name="svguse:icons.svg#pc" size="lg" color="teal" />
        <div class="q-ml-md">
          <div class="listname">WOL 서버</div>
          <div class="caption">시스템 상태 표시 및 설정</div>
        </div>
      </div>

      <div class="q-mr-sm q-gutter-sm">
        <q-btn rounded size="sm" unelevated color="green" @click="fnAllOn"
          >All On</q-btn
        >
        <q-btn rounded size="sm" unelevated color="red" @click="fnAllOff"
          >All Off</q-btn
        >
        <!-- <q-icon name="svguse:icons.svg#exclamation" size="md" color="red" />
        <q-icon name="svguse:icons.svg#check-circle" size="md" color="green" /> -->
      </div>
    </div>

    <!-- list -->
    <div class="q-mt-xl" style="height: 100%">
      <q-card class="shadow-15" style="border-radius: 1rem; height: 100%">
        <q-card-section>
          <div class="row justify-between items-center">
            <div class="row nowrap items-center">
              <q-icon
                class="q-mx-sm"
                name="svguse:icons.svg#ethernet"
                size="md"
              ></q-icon>
              <div>
                <div class="listname">Client List</div>
                <div class="caption">
                  현제 등록된 PC {{ listCount }}대 기동중 {{ idleCount }}대
                  동작중 {{ statusCount }}대 입니다.
                </div>
              </div>
            </div>
            <div class="q-gutter-x-sm">
              <q-btn
                flat
                round
                color="red-10"
                icon="svguse:icons.svg#trash"
                @click="fnDeleteAll"
              >
                <q-tooltip>전체삭제</q-tooltip>
              </q-btn>
              <q-btn
                round
                unelevated
                icon="svguse:icons.svg#refresh"
                @click="fnReSync"
              >
                <q-tooltip>새로고침</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <ClientsTable />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onBeforeMount, computed } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import ClientsTable from '../components/table.vue'
import InfoDialog from '../components/infoDialog.vue'

export default defineComponent({
  name: 'PageIndex',
  components: { ClientsTable },
  setup() {
    const { state, dispatch } = useStore()
    const $q = useQuasar()

    const list = computed(() => state.devices.devices)
    const listCount = computed(() => {
      return list.value.length
    })
    const idleCount = computed(() => state.devices.idleCount)
    const blockCount = computed(() => state.devices.blockCount)
    const statusCount = computed(() => state.devices.statusCount)

    const fnAllOn = () => {
      $q.dialog({
        title: 'Power On All',
        message: '등록된 모든 PC의 전원을 켭니다.',
        cancel: true,
        persistent: true
      }).onOk(() => {
        window.FN.onRequest({ command: 'allon' })
      })
    }

    const fnAllOff = () => {
      $q.dialog({
        title: 'Power OFF All',
        message: '등록된 모든 PC의 전원을 끕니다.',
        cancel: true,
        persistent: true
      }).onOk(() => {
        window.FN.onRequest({ command: 'alloff' })
      })
    }

    function fnDeleteAll() {
      $q.dialog({
        title: 'Delete All',
        message: '전제 리스트를 삭제 합니다.',
        cancel: true,
        persistent: true,
        html: true
      }).onOk(() => {
        window.FN.onRequest({ command: 'deleteAll' })
      })
    }

    function fnReSync() {
      window.FN.onRequest({ command: 'resync' })
    }

    onBeforeMount(async () => {
      window.FN.onResponse((args) => {
        switch (args.command) {
          case 'list':
            dispatch('devices/update', args.value)
            break
          case 'info':
            $q.dialog({
              component: InfoDialog
            })
            break
        }
      })
      window.FN.onRequest({ command: 'getlist' })
    })
    return {
      listCount,
      idleCount,
      statusCount,
      blockCount,
      fnDeleteAll,
      fnAllOn,
      fnAllOff,
      fnReSync
    }
  }
})
</script>

<style scoped>
.listname {
  font-size: 1rem;
  font-weight: 700;
}
.caption {
  font-size: 0.8rem;
  font-weight: 400;
}
.progress {
  position: absolute;
  overflow: visible;
  top: 50%;
  left: 50%;
  margin: -80px 0 0 -75px;
}
.btns {
  position: relative;
  overflow: visible;
  top: 10%;
  margin: 0 -65px;
}
.btn {
  width: 100px;
  height: 42px;
  background: #fff;
  margin: 0 20px;
  font-weight: 700;
  border: none;
  border-radius: 5px;
  box-shadow: 0 0 1rem 1rem grey;
}
</style>
