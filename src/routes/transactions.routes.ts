import { FastifyInstance } from "fastify";
import { knex } from "../database";
import {z} from "zod"
import crypto from "node:crypto"

export async function transactionsRoutes(app: FastifyInstance){
    app.post('/', async (request, reply)=>{
        
        const createTransactionsSchema =  z.object({
            title: z.string(),
            amount: z.number(),
            type: z.string(),
        })
        const { title, type, amount } = createTransactionsSchema.parse(request.body)

        await knex('transactions')
            .insert({
                id: crypto.randomUUID(),
                title,
                amount: type === 'credit' ? amount : amount * -1
        })  

        reply.status(201).send()
    })
}
 