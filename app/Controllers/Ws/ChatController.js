'use strict'

class ChatController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
  }

  onMessage(message) {
    console.log("Recibiendo confirmacion...")
    this.socket.broadcastToAll('message', message)
    console.log(message)
  }
  
  onSendConfirmation(){
    console.log("Enviado confirmacion...")
  }

}

module.exports = ChatController
