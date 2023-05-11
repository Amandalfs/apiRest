import { FastifyInstance } from "fastify";
import { knex } from "../database";
import {z} from "zod"
import crypto, { randomUUID } from "node:crypto"
import { checkSessionsIdExists } from "../middleweres/check-sessions-id-exists";

export async function transactionsRoutes(app: FastifyInstance){
    app.get('/', 
    {
        preHandler: [checkSessionsIdExists]
    },async (request)=>{

        const {  sessionId } = request.cookies;

        const transactions = await knex('transactions')
            .where({sessions_id: sessionId})
            .select('*')

        return {
            transactions
        }
    })

    app.get('/:id',
    {
        preHandler: [checkSessionsIdExists]
    },async (request, reply)=>{
        
        const { sessionId } = request.cookies

        const listBodySchema = z.object({
            id: z.string().uuid()
        })

        const { id } =  listBodySchema.parse(request.params);

        const transactions = await knex('transactions')
            .where({sessions_id: sessionId, id})
            .first();

        return {
            transactions
        }
    })

    app.get('/sumary', 
    {
        preHandler: [checkSessionsIdExists]
    },async (request)=>{
        const { sessionId } = request.cookies

        const sumary = await knex('transactions')
            .where({sessions_id: sessionId})
            .sum('amount', { as: 'amount'})
            .first()

        return {
            sumary
        }
    })

    app.post('/', async (request, reply)=>{
        
        const createTransactionsSchema =  z.object({
            title: z.string(),
            amount: z.number(),
            type: z.string(),
        })
        const { title, type, amount } = createTransactionsSchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if(!sessionId){
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dia
            })
        }


        await knex('transactions')
            .insert({
                id: crypto.randomUUID(),
                title,
                amount: type === 'credit' ? amount : amount * -1,
                sessions_id: sessionId,
            })  

        return reply.status(201).send()
    })
}
 