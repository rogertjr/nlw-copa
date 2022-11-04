import Fastify from "fastify"
import cors from "@fastify/cors"
import jwt from "@fastify/jwt"

import { pollRoutes } from "./routes/poll"
import { userRoutes } from "./routes/user"
import { guessRoutes } from "./routes/guess"
import { authRoutes } from "./routes/auth"
import { gameRoutes } from "./routes/game"


async function bootstrap() {    
    const fastify = Fastify({ logger: true })
    const jwtSecret: string | undefined = process.env.JWT_SECRET 
    
    if (jwtSecret) {
        await fastify.register(cors, { origin: true })
        await fastify.register(jwt, { secret: jwtSecret })

        await fastify.register(authRoutes)
        await fastify.register(gameRoutes) 
        await fastify.register(pollRoutes) 
        await fastify.register(userRoutes)
        await fastify.register(guessRoutes)
        
        await fastify.listen({ port: 3333, host: '0.0.0.0' })
    }
}

bootstrap()