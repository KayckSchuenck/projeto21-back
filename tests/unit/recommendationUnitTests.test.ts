import { faker } from "@faker-js/faker";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import {recommendationService} from '../../src/services/recommendationsService'

beforeEach(()=>{
    jest.clearAllMocks()
})

describe("Insert new recommendation", () => {
    it('Should create a new recommendation', async () => {
        jest.spyOn(recommendationRepository, 'findByName').mockImplementationOnce(()=>{
            return null
        })
        jest.spyOn(recommendationRepository, 'create').mockImplementationOnce(()=>{
            return null
        })
        const data={name:faker.music.songName(),youtubeLink:'https://www.youtube.com/watch?v=ZKecJ1Dk-WA'}
        await recommendationService.insert(data)
        expect(recommendationRepository.create).toHaveBeenCalled()
        expect(recommendationRepository.findByName).toHaveBeenCalled()
    })
})

describe("Insert new recommendation with the same name gives an error", () => {
    it('Should not create a new recommendation', async () => {
        const fakeName=faker.music.songName()
        jest.spyOn(recommendationRepository, 'findByName').mockImplementationOnce(():any=>{
            return {
                id:1,
                youtubeLink:'https://www.youtube.com/watch?v=ZKecJ1Dk-WA',
                name:fakeName,
                score:0
            }
        })
        const response=recommendationService.insert({
            youtubeLink:'https://www.youtube.com/watch?v=ZKecJ1Dk-WA',
            name:fakeName,
        })
        expect(response).rejects.toEqual({type:'conflict',message:'Recommendations names must be unique'})
    })
})

describe("Insert new upvote", () => {
    it('Should update the song score', async () => {
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any=>{
            return {
                id:1,
                youtubeLink:'https://www.youtube.com/watch?v=ZKecJ1Dk-WA',
                name:'MockRato',
                score:0
            }
        })
        jest.spyOn(recommendationRepository,'updateScore').mockImplementationOnce(():any=>{})
        await recommendationService.upvote(1)
        expect(recommendationRepository.updateScore).toBeCalled()
        expect(recommendationRepository.find).toBeCalled()
    })
    it("Should not update the song score as id isn't found", async () => {
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any=>{})
        const response=recommendationService.upvote(2)
        expect(response).rejects.toEqual({type:'not_found',message:''})
    })
})

describe("Insert new downvote", () => {
    it('Should update the song score', async () => {
        const recommendation={
            id:1,
            youtubeLink:'https://www.youtube.com/watch?v=ZKecJ1Dk-WA',
            name:'MockRato',
            score:0
        }
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any=>{
            return recommendation
        })
        jest.spyOn(recommendationRepository,'updateScore').mockImplementationOnce(():any=>{
            return recommendation
        })
        await recommendationService.downvote(1)
        expect(recommendationRepository.updateScore).toBeCalled()
        expect(recommendationRepository.find).toBeCalled()
    })
    it("Should not update the song score as id isn't found", async () => {
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any=>{})
        const response=recommendationService.downvote(2)
        expect(response).rejects.toEqual({type:'not_found',message:''})
    })
    it('Should delete the song if it has <-5 score', async () => {
        const recommendation={
                id:1,
                youtubeLink:'https://www.youtube.com/watch?v=ZKecJ1Dk-WA',
                name:'MockRato',
                score:-5
        }
        jest.spyOn(recommendationRepository, 'find').mockImplementationOnce(():any=>recommendation)
        jest.spyOn(recommendationRepository,'updateScore').mockImplementationOnce(():any=>{
            return {...recommendation,score:-6}
        })
        jest.spyOn(recommendationRepository,'remove').mockImplementationOnce(():any=>{})
        await recommendationService.downvote(recommendation.id)
        expect(recommendationRepository.find).toBeCalled()
        expect(recommendationRepository.updateScore).toBeCalled()
        expect(recommendationRepository.remove).toBeCalled()
    })
})