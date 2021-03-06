'use strict'

const Codigo = use('App/Models/Codigo')
const User = use('App/Models/User')
const {validate} = use('Validator')
const Hash = use('Hash')
const crypto = use('crypto')
const Mail = use('Mail')

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
            const user =await User.find(user_id)
            
                var codigo = crypto.randomBytes(3).toString('hex');

                const obj3 = new Object()
                obj3.codigo = await codigo
                await this.delay(2)
                console.log(user.email)
                await this.sendMailCode(user.email,obj3)
                
                const code = await Codigo.create({
                    'user_id':user_id,
                    'codigo':await Hash.make(codigo)
                })
                
                
                return response.status(201).json({
                    status:true,
                    codeHash:code,
                    code:codigo
                })
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

    async sendMailCode(email,data){
        const correo = await Mail.send('emails.mailaccess', data, (message) => {
            message
                .to(email)
                .from('rosamedina1008@gmail.com')
                .subject('Correo de acceso')
        })
        console.log(correo)
    }

    delay(n){
        return new Promise(function(resolve){
            setTimeout(resolve,n*1000);
        });
    }

    
}

module.exports = CodigoController
