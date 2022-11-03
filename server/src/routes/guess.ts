import { prisma } from "../lib/prisma"
import { FastifyInstance } from "fastify"
import { authenticate } from "../plugins/authenticate"
import { z } from "zod"

export async function guessRoutes(fastify: FastifyInstance) {
    // GET - http://localhost:3333/guesses/count
    fastify.get('/guesses/count', async () => {
        const count = await prisma.guess.count()
        return { count }
    })

    // GET - http://localhost:3333/polls/:pollId/games/:gameId/guesses
    fastify.post('/polls/:pollId/games/:gameId/guesses', { onRequest: [authenticate] }, async (request, response) => {
        const getGuessParams = z.object({
            pollId: z.string(),
            gameId: z.string()
        })

        const createGuessBody = z.object({
            firstTeamPoints: z.number(),
            secondTeamPoints: z.number()
        })

        const { pollId, gameId } = getGuessParams.parse(request.params)
        const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(request.body)

        const participant = await prisma.participant.findUnique({
            where: {
                userId_pollId: {
                    pollId,
                    userId: request.user.sub
                }
            }
        })

        if (!participant) {
            return response.status(400).send({ message: "Not participating" })
        }

        const guess = await prisma.guess.findUnique({
            where: {
                participantId_gameId: {
                    participantId: participant.id,
                    gameId
                }
            }
        })

        if (guess) {
            return response.status(400).send({ message: "Already sent guess to this poll" })
        }

        const game = await prisma.game.findUnique({
            where: { id: gameId }
        })

        if (!game) {
            return response.status(400).send({ message: "Game not found" })
        }

        if (game.date < new Date()) {
            return response.status(400).send({ message: "You can't send guesses after the game" })
        }

        await prisma.guess.create({
            data: {
                gameId,
                participantId: participant.id,
                firstTeamPoints,
                secondTeamPoints
            }
        })

        return response.status(201).send()
    })
}
