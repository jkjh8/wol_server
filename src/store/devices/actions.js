/*
export function someAction (context) {
}
*/
export function update({ commit }, payload) {
  console.log(payload)
  commit('updateDevices', payload.list)
  commit('updateIdle', payload.idleCount)
  commit('updateBlock', payload.blockCount)
  commit('updateStatus', payload.statusCount)
}
