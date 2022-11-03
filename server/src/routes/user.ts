import { prisma } from "../lib/prisma"
import { FastifyInstance } from "fastify"

export async function userRoutes(fastify: FastifyInstance) {
    // GET - http://localhost:3333/users/count
    fastify.get('/users/count', async () => {
        const count = await prisma.user.count()
        return { count }
    })
}
