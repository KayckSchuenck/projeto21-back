import {prisma} from '../src/database'

export async function generateIdFactory(body){
    const {id}=await prisma.recommendation.findUnique({
        select:{id:true},
        where:{name:body.name}
    })
    return id
}
