import fastify from 'fastify'
import { knex } from './database'
import { env } from './env'

const app = fastify()

app.get('/hello', async (request, reply)=>{
    const transaction = await knex('transactions').select('*')
    
    return transaction;
})


app.listen({ 
        port: env.PORT
    })
    .then(()=>{
        console.log("Server rodando usando fastify");
    })