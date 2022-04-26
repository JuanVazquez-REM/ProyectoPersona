'use strict'

const Env = use('Env')

module.exports = {
  signatureKey: Env.getOrFail('APP_KEY'),
    defaultExpirationTimeInHour: 24,
    options: {
        expires: 'expires',
        signature: 'signature'
    }
}
