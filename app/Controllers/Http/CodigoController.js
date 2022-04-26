'use strict'

const Codigo = use('App/Models/Codigo')
const {validate} = use('Validator')
const Hash = use('Hash')
const crypto = use('crypto')

class CodigoController {
    async create({request, response}){
        const rules = {
            user_id: 'required|integer|min:1',
        }

        const validation = await validate(request.all(), rules)
        
        if(validation.fails()){
            return response.status(200).json({
                status:false,
                message: validation.messages()
            })
        } else {
            const {user_id} = request.only(['user_id'])
            try {
                var codigo = crypto.randomBytes(3).toString('hex');
                
                const code = await Codigo.create({
                    'user_id':user_id,
                    'codigo':await Hash.make(codigo)
                })
                
                return response.status(201).json({
                    status:true,
                    codeHash:code,
                    code:codigo
                })
            } catch (error) {
                return response.status(400).json({
                    status: false,
                    message: error
                })
            }
        }
    }

    async verify({request, response}){
        const rules = {
            user_id: 'required|integer|min:1',
            codigo: 'required|string|min:1',
        }

        const validation = await validate(request.all(), rules)
        
        if(validation.fails()){
            return response.status(200).json({
                status:false,
                message: validation.messages()
            })
        } else {
            const {user_id,codigo} = request.only(['user_id','codigo'])
        
                const codigoFind = await Codigo.query().where('user_id',user_id).last()

                const isVerify = await Hash.verify(codigo, codigoFind.codigo)

                if(isVerify){
                    await codigoFind.delete()
                    return response.status(200).json({
                        status:true,
                        message:"Codigo valido"
                    })
                }else{
                    return response.status(200).json({
                        status:false,
                        message:"Codigo invalido"
                    })
                }
                

        }
    }

    
}

module.exports = CodigoController
