import {faker} from '@faker-js/faker'

export async function createPostTestBodyFactory(){
    const complement=faker.random.alpha(11)
    return {
        name: faker.name.fullName(),
        youtubeLink: `https://www.youtube.com/watch?v=${complement}`
    };
}

