'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CodigoSchema extends Schema {
  up () {
    this.create('codigos', (table) => {
      table.increments()
      table.integer('user_id').notNullable()
      table.string('codigo').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('codigos')
  }
}

module.exports = CodigoSchema
