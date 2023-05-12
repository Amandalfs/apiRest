import { expect, it, describe, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import app from '../app'
import { execSync } from 'child_process'

describe("transactions routes",()=>{

    beforeAll(async()=>{
        await app.ready()
    })
    
    afterAll(async ()=>{
        await app.close()
    })

    beforeEach(()=>{
        
        execSync("npm run knex -- migrate:latest")
    })

    afterEach(()=>{
        execSync("npm run knex -- migrate:rollback --all")
    })
    
    it("should be able to create a new transaction", async ()=>{
        // fazer chamadas HTTP p/criar uma nova transacao
    
        await request(app.server)
            .post("/transactions")
            .send({
                title: "New Transaction",
                amount: 5000,
                type: "credit"
            })
            .expect(201)
    })

    it("should be able to list all transactions", async ()=>{
        const createTransactionReponse = await request(app.server)
        .post("/transactions")
        .send({
            title: "New Transaction",
            amount: 5000,
            type: "credit"
        })

        const cookies = createTransactionReponse.get('Set-Cookie')

        const listTransactionsReponse = await request(app.server)
            .get('/transactions')
            .set("Cookie", cookies)
            .expect(200)

        expect(listTransactionsReponse.body.transactions).toEqual([
            expect.objectContaining({
                title: "New Transaction",
                amount: 5000,
            })
        ])
    })

    it("should be able to get a specific transaction", async ()=>{
        const createTransactionReponse = await request(app.server)
        .post("/transactions")
        .send({
            title: "New Transaction",
            amount: 5000,
            type: "credit"
        })

        const cookies = createTransactionReponse.get('Set-Cookie')

        const listTransactionsReponse = await request(app.server)
            .get("/transactions")
            .set("Cookie", cookies)
            
        const listTransactionsReponseOnly = await request(app.server)
            .get(`/transactions/${listTransactionsReponse.body.transactions[0].id}`)
            .set("Cookie", cookies)
            .expect(200)

        expect(listTransactionsReponseOnly.body.transactions).toEqual(
            expect.objectContaining({
                title: "New Transaction",
                amount: 5000,
            })
        )
    })

    it.only("should be able to get sumary", async ()=>{

        
    

        const createTransactionReponse = await request(app.server)
            .post("/transactions")
            .send({
                title: "Credit Transaction2",
                amount: 5000,
                type: "credit"
            })

        const cookies = createTransactionReponse.get('Set-Cookie')

        await request(app.server)
            .post("/transactions")
            .set("Cookie", cookies)
            .send({
                title: "Debit Transaction2",
                amount: 2000,
                type: "debit"
            })




        const listTransactionsReponseSumary = await request(app.server)
            .get('/transactions/sumary')
            .set("Cookie", cookies)
            .expect(200)

        expect(listTransactionsReponseSumary.body.sumary).toEqual({
                amount: 3000
        })

    })

})

