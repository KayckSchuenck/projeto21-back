import app from '../../src/app';
import supertest from 'supertest';
import {prisma} from '../../src/database';
import {createPostTestBodyFactory} from '../../factories/bodyFactory'
import {generateIdFactory} from '../../factories/idFactory'
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import {amountFactory,randomVotesFactory} from '../../factories/randomFactory'

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
  });
  
afterAll(async () => {
    await prisma.$disconnect();
});


describe("POST /recommendations", () => {
    it("given a correct body it should return 201", async () => {
        const body=await createPostTestBodyFactory()
        const result = await supertest(app).post("/recommendations").send(body)
        const status = result.status;
        
        expect(status).toEqual(201);
    })
})  

describe("POST /recommendations", () => {
    it("given a repeated name it should return 409", async () => {
        const body=await createPostTestBodyFactory()
        await supertest(app).post("/recommendations").send(body)

        const result = await supertest(app).post("/recommendations").send(body)
        const status = result.status;
        
        expect(status).toEqual(409);
    })
})  

describe("POST /recommendations/:id/upvote", () => {
    it("should return 200 after updating score ", async () => {
        const body=await createPostTestBodyFactory()
        await supertest(app).post("/recommendations").send(body)
        const id=await generateIdFactory(body)

        const result = await supertest(app).post(`/recommendations/${id}/upvote`)
        const status = result.status;
        
        expect(status).toEqual(200);
    })
})

describe("POST /recommendations/:id/downvote", () => {
    it("should return 200 after updating score ", async () => {
        const body=await createPostTestBodyFactory()
        await supertest(app).post("/recommendations").send(body)
        const id=await generateIdFactory(body)

        const result = await supertest(app).post(`/recommendations/${id}/downvote`)
        const status = result.status;
        
        expect(status).toEqual(200);
    })
})

describe("POST /recommendations/:id/downvote", () => {
    it("should return 200 after updating score, and if score<-5, it should be removed", async () => {
        const body=await createPostTestBodyFactory()
        await supertest(app).post("/recommendations").send(body)
        const id=await generateIdFactory(body)

        for(let i=0;i<6;i++){
            await supertest(app).post(`/recommendations/${id}/downvote`)
        }

        const result=await recommendationRepository.find(id);
        expect(result).toBe(null)
    })
})

describe("POST /recommendations/:id /downvote and /upvote", () => {
    it("if id isn't found, it should return 404", async () => {
        const id=0

        const downvote = await supertest(app).post(`/recommendations/${id}/downvote`)
        const upvote = await supertest(app).post(`/recommendations/${id}/upvote`)

        expect(downvote.status).toEqual(404);
        expect(upvote.status).toEqual(404);
    })
})

describe("GET /recommendations", () => {
    it("should get 10 last recommendations", async () => {
        for(let i=0;i<10;i++){
            const body=await createPostTestBodyFactory()
            await supertest(app).post("/recommendations").send(body)
        }

        const result = await supertest(app).get(`/recommendations`)

        expect(result.status).toEqual(200);
        expect(result.body.length).toBe(10)
    })
})

describe("GET /recommendations/:id", () => {
    it("given an existing id, get it's correspondent recommendation", async () => {
        const body=await createPostTestBodyFactory()
        await supertest(app).post("/recommendations").send(body)
        const id=await generateIdFactory(body)

        const result = await supertest(app).get(`/recommendations/${id}`)

        const verify={...body,id,score:0}
        expect(result.status).toEqual(200);
        expect(result.body).toMatchObject(verify)
    })
})

describe("GET /recommendations/:id", () => {
    it("given an unexisting id, throw not found error", async () => {
        const id=0
        const result = await supertest(app).get(`/recommendations/${id}`)

        expect(result.status).toEqual(404);
    })
})

describe("GET /recommendations/random", () => {
    it("get a random recommendation", async () => {
        const body=await createPostTestBodyFactory()
        await supertest(app).post("/recommendations").send(body)

        const result = await supertest(app).get(`/recommendations/random`)

        expect(result.status).toEqual(200);
        expect(result.body).toBeInstanceOf(Object)
    })
})

describe("GET /recommendations/random", () => {
    it("if there is no recommendation, it returns 404", async () => {
        
        const result = await supertest(app).get(`/recommendations/random`)
        expect(result.status).toEqual(404);
    })
})

describe("GET /recommendations/top/:amount", () => {
    it("get x songs with greater scores", async () => {
        
        const amountTopSongs=await amountFactory()
        await randomVotesFactory(amountTopSongs)
        const result = await supertest(app).get(`/recommendations/top/${amountTopSongs}`)

        expect(result.body.length).toBeGreaterThan(0)
        expect(result.body.length).toBeLessThan(amountTopSongs+1)
        expect(result.status).toEqual(200);
    })
})