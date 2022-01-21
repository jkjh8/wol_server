/*
export function someMutation (state) {
}
*/
export function updateDevices(state, payload) {
  state.devices = payload
}

export function updateIdle(state, payload) {
  state.idleCount = payload
}

export function updateBlock(state, payload) {
  state.blockCount = payload
}

export function updateStatus(state, payload) {
  state.statusCount = payload
}
