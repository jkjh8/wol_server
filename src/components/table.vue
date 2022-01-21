<template>
  <q-table
    flat
    :rows="list"
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

              <q-badge v-if="props.row.block" rounded floating color="yellow" />

              <q-badge v-if="!props.row.status" rounded floating color="red" />

              <q-badge v-if="props.row.idle" rounded floating color="purple" />
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
            <q-btn round flat size="sm" @click="fnOn(props.row)">ON</q-btn>
            <q-btn round flat size="sm" @click="fnOff(props.row)">OFF</q-btn>
            <q-btn round flat size="sm" @click="fnDelete(props.row)">
              <q-icon name="svguse:icons.svg#trash" color="red" />
            </q-btn>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import { computed, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

export default {
  setup() {
    const { state, dispatch } = useStore()
    const $q = useQuasar()

    const list = computed(() => state.devices.devices)

    const fnOn = (item) => {
      $q.dialog({
        title: 'Power On',
        message: `<strong>${item.mac}</strong>이 전원을 켭니다.`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        window.FN.onRequest({
          command: 'on',
          value: item,
        })
      })
    }

    const fnOff = (item) => {
      $q.dialog({
        title: 'Power Off',
        message: `<strong>${item.mac}</strong>의 전원을 끕니다.`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        window.FN.onRequest({
          command: 'off',
          value: item,
        })
      })
    }

    const fnDelete = (item) => {
      $q.dialog({
        title: 'Delete',
        message: `<strong>${item.mac}</strong>가 리스트에서 삭제 됩니다.`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        window.Fn.onRequest({
          command: 'delete',
          value: item,
        })
      })
    }

    onBeforeMount(async () => {
      window.FN.onResponse((args) => {
        switch (args.command) {
          case 'list':
            dispatch('devices/update', args.value)
            break
        }
      })
      window.FN.onRequest({ command: 'getlist' })
    })

    return {
      list,
      fnOn,
      fnOff,
      fnDelete,
    }
  },
}
</script>
