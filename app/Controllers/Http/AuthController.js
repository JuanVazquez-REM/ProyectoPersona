'use strict'

const User = use('App/Models/User')


const {validate} = use('Validator')
const Hash = use('Hash')
const crypto = use('crypto')
const Mail = use('Mail')
const UrlSigner = use("UrlSigner");
const Encryption = use('Encryption')

class AuthController {
    async login({request, response, auth}){

        const rules = {
            email: 'required|string',
            password: 'required|string',
        }

        const validation = await validate(request.all(), rules)

        if(validation.fails()){
            return response.status(200).json({
                status: false,
                message: validation.messages()
            })
        } else {
            const {email, password} = request.only(['email','password'])
            const user = await User.query().where('email',email).first()

            if(!user){
                return response.status(400).json({
                    status: false,
                    error: "Usuario no registrado",
                    message: "Email o contraseña incorrecta"
                })
            }
            
            const isVerify = await Hash.verify(password, user.password)

            if(isVerify){
                //Email y password verificados
                switch (user.rol) {
                    case "white":
                        console.log("WHITE")
                            if(request.ip() == "192.168.1.1"){
                                return response.status(200).json({
                                    status: false,
                                    message: "No tienes acceso",
                                    rol: "white",
                                    ip: request.ip()
                                })
                            }
                            const token = await auth.attempt(email,password)
                            await user.save()
                            return response.status(200).json({
                                status: true,
                                message: "Se incio correctamente",
                                rol: "white",
                                token: token,
                                ip: request.ip()
                            })
                        break;
                    case "grey":
                        console.log("GREY")
                        if(request.ip() == "192.168.1.1"){
                            return response.status(200).json({
                                status: false,
                                message: "No tienes acceso",
                                rol: "white",
                                ip: request.ip()
                            })
                        }
                            const userupdategrey = await User.find(user.id)
                            var codigo1 = crypto.randomBytes(3).toString('hex');
                            
                            const codigohash = await Hash.make(codigo1)
                            await this.delay(1)
                            userupdategrey.codi = codigohash
                            
                            await userupdategrey.save()   
                            const isVerify = await Hash.verify(codigo1,userupdategrey.codi)
                            console.log(isVerify)

                            const obj = new Object()
                            obj.codigo = codigo1

                            await this.sendMail(user.email,obj)
                                

                            const urltemp = UrlSigner.temporarySign('http://104.131.21.154/confirmacion', .1, {Hfrlmi:user.id});
                            return response.status(200).json({
                                status: true,
                                message: "Confirme su email",
                                rol:"grey",
                                url: urltemp,
                                ip: request.ip(),
                                ips: request.ips()
                            })

                        break;
                    case "black":
                        console.log("BLACK")
                            const userupdate = await User.find(user.id)
                            var codigo = crypto.randomBytes(3).toString('hex');
                            
                            userupdate.codi = await Hash.make(codigo)
                            await this.delay(1)
                            await userupdate.save()
                            
                            const obj1 = new Object()
                            obj1.codigo = codigo

                            await this.sendMail(user.email,obj1)

                        
                            const urltemp1 = UrlSigner.temporarySign('http://104.131.21.154/confirmacion', .1, {Hfrlmi:user.id});
                            return response.status(200).json({
                                status: true,
                                message: "Confirme su email",
                                rol:"black",
                                url: urltemp1,
                                id:userupdate.id
                            }) 
                            break;
                    default:
                        return response.status(401).json({
                            status: false,
                            message: "Rol no existente",
                        })
                        break
                }
            }else{
                return response.status(400).json({
                    status: false,
                    message: "Email o contraseña incorrecta",
                })
            }
        }
    }

    async check({response,auth, request}){
        try {
            await auth.check()

            return response.status(200).json({
                status: true,
                message: "Token valido",
                user: auth.user,
                ip: request.ip()
            })
            
        } catch (error) {
            return response.status(200).json({
                status: false,
                message: "Token Invalido"
            })
        }
    }

    async confirmacion({response,request, auth,params}){
        const rules = {
            codigo: 'required|string|min:1',
        }

        const validation = await validate(request.all(), rules)

        if(validation.fails()){
            return response.status(200).json({
                status: false,
                message: validation.messages()
            })
        } else {
            const url = request.get()
            const user = await User.query().where('id', url.Hfrlmi).first()
            const isVerify = await Hash.verify(request.input('codigo'),user.codi)
            if(isVerify){
                if(user.rol =="black"){
                    if(request.ip() == "192.168.1.1"){
                        const token = await auth.generate(user)
                        return response.status(200).json({
                            status: true,
                            message: "Bienvenido",
                            rol: "white",
                            ip: request.ip(),
                            token:token
                        })
                    }
                    return response.status(200).json({
                        status: true,
                        message: "Verificado",
                        rol: user.rol,
                        user: user,
                        ip:request.ip()
                    })
                }else{
                    const token = await auth.generate(user)
                    return response.status(200).json({
                    status: true,
                    message: "Token creado",
                    token: token,
                    user: user
                })
                }
            }else{
                return response.status(200).json({
                    status: false,
                    message: "Codigo incorrecto",
                })
            }
            
        }
    }

    async sendMail(email,data){
        console.log("enviando correo")
        const correo = await Mail.send('emails.mailconfirmed', data, (message) => {
            message
                .to(email)
                .from('rosamedina1008@gmail.com')
                .subject('Correo de confirmacion')
        })
        console.log(correo)
    }

    async logout ({ auth, response }) {
        const user = auth.current.user
        const token = auth.getAuthHeader()
    
        await user.tokens().where('token', token).update({ is_revoked: true })

        return response.status(200).json({
        status: true,
        message: "Logout correcto",
        });
    }  
    
    async create ({ response, request, auth }) {
        const user = await User.find(request.input("user_id"))
        const token = await auth.generate(user)
        if(token){
            return response.status(200).json({
                status: true,
                message: "Se genero el token",
                token: token
            });
        }else{
            return response.status(200).json({
                status: false,
                message: "No se pudo generar al token",
            });
        }
    } 

    delay(n){
        return new Promise(function(resolve){
            setTimeout(resolve,n*1000);
        });
    }
}

module.exports = AuthController
