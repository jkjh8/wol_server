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
                  현제 등록된 PC {{ listCount }}대 기동중 {{ idleCount }}대 동작중
                  {{ statusCount }}대 입니다.
                </div>
              </div>
            </div>
            <div>
              <q-btn round unelevated @click="fnDeleteAll">
                <q-icon name="svguse:icons.svg#refresh" color="green-10"></q-icon>
              </q-btn>
          </div>
          </div>
        </q-card-section>
        <q-card-section>
          <q-table
            flat
            :rows="rows"
            :columns="[
              {
                name: 'idx',
                align: 'center',
                label: 'No.',
                field: 'idx',
                sortable: true,
              },
              {
                name: 'name',
                align: 'center',
                label: 'HostName',
                field: 'hostname',
                sortable: true,
              },
              {
                name: 'address',
                align: 'center',
                label: 'IP Addr',
                field: 'address',
                sortable: true,
              },
              {
                name: 'actions',
                align: 'center',
                label: 'Actions',
              },
            ]"
            row-key="_id"
            :pagination="{ rowsPerPage: 20 }"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="idx" :props="props">
                  <div class="row justify-center items-center">
                    <q-avatar
                      class="text-center"
                      size="24px"
                      style="border: 1px solid grey"
                    >
                      {{ props.row.idx }}

                      <q-badge
                        v-if="props.row.block"
                        rounded
                        floating
                        color="yellow"
                      />

                      <q-badge
                        v-if="!props.row.status"
                        rounded
                        floating
                        color="red"
                      />

                      <q-badge
                        v-if="props.row.idle"
                        rounded
                        floating
                        color="purple"
                      />
                    </q-avatar>
                  </div>
                </q-td>

                <q-td key="name" :props="props">
                  {{ props.row.hostname }}
                </q-td>
                <q-td key="address" :props="props">
                  <div style="text-weight: 700">
                    {{ props.row.address }}
                  </div>
                  <div class="caption">
                    {{ props.row.mac }}
                  </div>
                </q-td>
                <q-td key="actions" :props="props">
                  <div class="q-gutter-sm row justify-center items-center">
                    <q-btn round flat size="sm" @click="fnOn(props.row)"
                      >ON</q-btn
                    >
                    <q-btn round flat size="sm" @click="fnOff(props.row)"
                      >OFF</q-btn
                    >
                    <q-btn round flat size="sm" @click="fnDelete(props.row)">
                      <q-icon name="svguse:icons.svg#trash" color="red" />
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onBeforeMount, computed } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'PageIndex',
  setup() {
    const $q = useQuasar()
    const rows = ref([])
    const interval = ref(null)
    const listCount = ref(0)
    const idleCount = ref(0)
    const blockCount = ref(0)
    const statusCount = ref(0)

    function fnStartInterval() {
      interval.value = setInterval(() => {
        window.list.get()
      }, 5000)
    }

    function fnAllOn(item) {
      $q.dialog({
        title: 'Power On',
        message: `등록된 모든 PC의 전원을 켭니다.`,
        cancel: true,
        persistent: true,
        html: true,
      }).onOk(() => {
        window.Fn.allon()
      })
    }

    function fnAllOff(item) {
      $q.dialog({
        title: 'Power On',
        message: `등록된 모든 PC의 전원을 끕니다.`,
        cancel: true,
        persistent: true,
        html: true,
      }).onOk(() => {
        window.Fn.alloff()
      })
    }

    function fnOn(item) {
      $q.dialog({
        title: 'Power On',
        message: `<strong>${item.mac}</strong>이 전원을 켭니다.`,
        cancel: true,
        persistent: true,
        html: true,
      }).onOk(() => {
        window.Fn.on({ ...item })
      })
    }

    function fnOff(item) {
      $q.dialog({
        title: 'Delete',
        message: `<strong>${item.mac}</strong>의 전원을 끕니다.`,
        cancel: true,
        persistent: true,
        html: true,
      }).onOk(() => {
        window.Fn.off({ ...item })
      })
    }

    function fnDelete(item) {
      $q.dialog({
        title: 'Delete',
        message: `<strong>${item.mac}</strong>가 리스트에서 삭제 됩니다.`,
        cancel: true,
        persistent: true,
        html: true,
      }).onOk(() => {
        window.Fn.delete({ ...item })
      })
    }

    function fnDeleteAll() {
      $q.dialog({
        title: 'Delete',
        message: '전제 리스트를 삭제 합니다.',
        cancel: true,
        persistent: true,
        html: true,
      }).onOk(() => {
        window.Fn.deleteAll()
      })
    }

    onBeforeMount(async () => {
      window.list.onResponse((args) => {
        rows.value = args.list
        listCount.value = args.listCount
        idleCount.value = args.idleCount
        blockCount.value = args.blockCount
        statusCount.value = args.statusCount
      })

      window.list.get()
      fnStartInterval()
    })
    return {
      rows,
      listCount,
      idleCount,
      statusCount,
      blockCount,
      fnOn,
      fnOff,
      fnDelete,
      fnDeleteAll,
      fnAllOn,
      fnAllOff,
    }
  },
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
