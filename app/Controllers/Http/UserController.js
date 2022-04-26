'use strict'

const User = use('App/Models/User')
const {validate} = use('Validator')


class UserController {
    async register({request, response}){
        const rules = {
            nombre: 'required|string|max:80|min:1',
            email: 'required|email|max:254|min:1',
            password: 'required|string|max:60|min:1',
            rol: 'required|string|max:5|min:1',
        }

        const validation = await validate(request.all(), rules)
        
        if(validation.fails()){
            return response.status(200).json({
                status:false,
                message: validation.messages()
            })
        } else {
            const {nombre,email,password,rol} = request.only(['nombre','email','password','rol'])

            
            try {
                const user = await User.create({
                    'nombre':nombre,
                    'email': email,
                    'password': password,
                    'rol':rol
                })
                
                response.status(201).json({
                    status:true,
                    user:user
                })
            } catch (error) {
                response.status(400).json({
                    status: false,
                    message: error
                })
            }
        }
    }
}

module.exports = UserController
