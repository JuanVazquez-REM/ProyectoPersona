'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('/login','AuthController.login')
Route.post('/register','UserController.register')


Route.get('/logout','AuthController.logout').middleware(['auth'])
Route.get('/check','AuthController.check').middleware(['auth'])

Route.post('/confirmacion','AuthController.confirmacion')
Route.post('/rol','RolController.create')

Route.post('/post','PostController.create')
Route.get('/post','PostController.read')
Route.get('/post/:id?','PostController.readById')
Route.put('/post/:id?','PostController.update')
Route.delete('/post/:id?','PostController.delete')

Route.post('/codigo','CodigoController.create')
Route.post('/verify/codigo','CodigoController.verify')
Route.post('/get/black','AuthController.create')
