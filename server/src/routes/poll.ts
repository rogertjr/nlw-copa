import { prisma } from "../lib/prisma"
import { z } from "zod"
import ShortUniqueId from "short-unique-id"
import { FastifyInstance } from "fastify"
import { authenticate } from "../plugins/authenticate"

export async function pollRoutes(fastify: FastifyInstance) {
    // GET - http://localhost:3333/polls/count
    fastify.get('/polls/count', async () => {
        const count = await prisma.poll.count()
        return { count }
    })

    // GET - http://localhost:3333/polls
    fastify.get('/polls', { onRequest: [authenticate] }, async (request) => {
        const polls = await prisma.poll.findMany({
            where: {
                participants: {
                    some: {
                        userId: request.user.sub
                    }
                }
            },
            include: {
                _count: {
                    select: { participants: true }
                },
                participants: {
                    select: { 
                        id: true,
                        user: {
                            select: { avatarURL: true } 
                        }
                    },
                    take: 4
                },
                owner: {
                    select: { 
                        id: true,
                        name: true
                    }
                }
            }
        })
        return { polls }
    })

    // GET - http://localhost:3333/polls/:id
    fastify.get('/polls/:id', { onRequest: [authenticate] }, async (request) => {
        const getPollParams = z.object({
            id: z.string()
        })

        const { id } = getPollParams.parse(request.params)

        const poll = await prisma.poll.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { participants: true }
                },
                participants: {
                    select: { 
                        id: true,
                        user: {
                            select: { avatarURL: true } 
                        }
                    },
                    take: 4
                },
                owner: {
                    select: { 
                        id: true,
                        name: true
                    }
                }
            }
        })
        return { poll }
    })

    // POST - http://localhost:3333/polls
    fastify.post('/polls', async (request, response) => {
        const createPollBody = z.object({
            title: z.string()
        })

        const { title } = createPollBody.parse(request.body)
        const generateCode = new ShortUniqueId({ length: 6 })
        const code = String(generateCode()).toUpperCase()

        try {
            await request.jwtVerify()

            await prisma.poll.create({
                data: {
                    title: title,
                    code: code,
                    ownerId: request.user.sub,
                    participants: {
                        create: {
                            userId: request.user.sub
                        }
                    }
                }
            })
        } catch {
            await prisma.poll.create({
                data: {
                    title: title,
                    code: code
                }
            })
        }

        return response.status(201).send({ code })
    })

    // POST - http://localhost:3333/polls/join
    fastify.post('/polls/join', { onRequest: [authenticate] }, async (request, response) => { 
        const joinPollBody = z.object({
            code: z.string()
        })

        const { code } = joinPollBody.parse(request.body)
        const poll = await prisma.poll.findUnique({ 
            where: { code },
            include: {
                participants: {
                    where: {
                        userId: request.user.sub
                    }
                }
            }
        })
        
        if (!poll) {
            return response.status(400).send({ message: "Poll not found" })
        }

        if (poll.participants.length > 0) {
            return response.status(400).send({ message: "Poll already joined" })
        }

        if (!poll.ownerId) {
            await prisma.poll.update({
              where: { id: poll.id },
              data: {
                ownerId: request.user.sub
              }
            })    
        }

        await prisma.participant.create({
            data: {
                pollId: poll.id,
                userId: request.user.sub
            }
        })

        return response.status(201).send()
    })
}
