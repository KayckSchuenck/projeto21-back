import {faker} from '@faker-js/faker'
import {createPostTestBodyFactory} from '../factories/bodyFactory'
import { recommendationRepository } from '../src/repositories/recommendationRepository';

export async function amountFactory() {
    return faker.datatype.number(100)
}

export async function randomVotesFactory(number:number){
    const iterationsPost=faker.datatype.number(number)
    const upvotes=faker.datatype.number(100)

    for(let i=0;i<iterationsPost;i++){
        const body=await createPostTestBodyFactory()
        const bodyWithScore={...body,score:upvotes}
        await recommendationRepository.createScoredBody(bodyWithScore)
    }
}