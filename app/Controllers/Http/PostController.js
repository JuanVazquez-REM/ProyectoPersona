'use strict'

const Post = use('App/Models/Post')
const {validateAll} = use('Validator')

class PostController {
    async create({request,response}){
        const input = request.all();

        const validation = await validateAll(input, {
            'titulo': 'required|min:1|string|max:80',
            'texto': 'required|min:1|string',
        });

        if(validation.fails()){
            return response.status(400).json({
                status: false,
                message: validation.messages() 
            })
        }else{
            const {titulo,texto} = request.only(['titulo','texto'])
            try {
                const post = await Post.create({
                    'titulo': titulo,
                    'texto': texto,
                })

                if(post){
                    return response.status(201).json({
                        status: true,
                        post:post
                    })
                }
            } catch (error) {
                return response.status(400).json(error)
            }
        }
    }


    async update ({response, request,params}){
            const {titulo,texto} = request.only(['titulo','texto'])
            
            const post = await Post.query().where('id',params.id).first()

            if(titulo){
                post.titulo = titulo
            }
            if(texto){
                post.texto = texto
            }

            if(await post.save()){
                return response.status(200).json({
                    status:true,
                    post:post
                })
            }else{
                return response.status(200).json({
                    status:false,
                    message:"No se actualizo"
                })
            }
        }
        
    

    async delete ({response, params}){
        const {id} = params
        const post = await Post.find(id)
        if(await post.delete()){
            return response.status(200).json({
                status: true,
                message: "Post eliminado correctamente"
            })
        }else{
            return response.status(200).json({
                status: false,
                message: "El post no fue eliminado"
            })
        }
    }

    async read ({response, request}){
        const posts = await Post.all()
        if(posts){
            return response.status(200).json({
                status: true,
                posts: posts,
                ip:await request.ip(),
                ips: await request.ips()
            })
        }else{
            return response.status(200).json({
                status: false,
                message: "Algo salio mal"
            })
        }
    }

    async readById ({params,response}){
        const post = await Post.find(params.id)
        if(post){
            return response.status(200).json({
                status: true,
                post: post
            })
        }else{
            return response.status(200).json({
                status: false,
                message: "Algo salio mal"
            })
        }
    }
}

module.exports = PostController
