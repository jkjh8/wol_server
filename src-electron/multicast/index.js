import { BrowserWindow } from 'electron'
import dgram from 'dgram'
import db from '../db'

let multicast
const maddr = '230.185.192.109'
const server_port = 52319
const client_port = 56434

function createMulticast() {
  return new Promise((resolve, reject) => {
    try {
      const timer = setTimeout(() => {
        reject(null, 'connection time out')
      }, 5000)
      multicast = dgram.createSocket('udp4')
      multicast.bind(server_port, () => {
        console.log('multicast server start')
        multicast.setBroadcast(true)
        multicast.setMulticastTTL(128)
        multicast.addMembership(maddr)
        clearTimeout(timer)

        multicast.on('message', (message) => {
          parser(message)
        })
        resolve(multicast)
      })
    } catch (e) {
      console.error('multicast server open error', e)
      reject(e)
    }
  })
}

async function parser(args) {
  try {
    const msg = JSON.parse(args)
    console.log(msg)
  } catch (e) {
    console.error('Multicast message parser error ', e)
  }
}

function multicastSend(msg) {
  try {
    multicast.send(JSON.parse(msg), client_port, maddr)
  } catch (e) {
    console.error('Multicast send error ', e)
  }
}

export { multicast, createMulticast, multicastSend }
