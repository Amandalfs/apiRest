import fastify from 'fastify'
import { transactionsRoutes } from './routes/transactions.routes'
import cookie from "@fastify/cookie"

const app = fastify()

app.register(cookie)

app.register(transactionsRoutes, {
    prefix: 'transactions'
});

export default app