'use strict'

const Rol = use('App/Models/Rol')
const {validateAll} = use('Validator')

class RolController {
    async create({request, response}){
        const input = request.all();

        const validation = await validateAll(input, {
            'rol': 'string|max:5|min:1',
        });
        
        if(validation.fails()){
            return response.status(200).json({
                status:false,
                message: validation.messages()
            })
        } else {
            const {rol} = request.only(['rol'])
            try {
                const nuevo = await Rol.create({
                    'rol':rol
                })
                
                response.status(201).json({
                    status:true,
                    rol:nuevo
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

module.exports = RolController
