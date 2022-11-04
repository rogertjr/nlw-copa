import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            avatarURL: 'https://github.com/rogertjr.png'
        }
    })

    const poll = await prisma.poll.create({
        data: {
            title: 'Example Poll',
            code: 'BOL123',
            ownerId: user.id,
            participants: {
                create: {
                    userId: user.id
                }
            }
        }
    })

    await prisma.game.create({
        data: {
            date: "2022-12-02T15:00:00.812Z",
            firstTeamCountryCode: "DE",
            secondTeamCountryCode: "BR"
        }
    })

    await prisma.game.create({
        data: {
            date: "2022-12-03T15:00:00.812Z",
            firstTeamCountryCode: "CM",
            secondTeamCountryCode: "BR"
        }
    })

    await prisma.game.create({
        data: {
            date: "2022-12-04T15:00:00.812Z",
            firstTeamCountryCode: "BR",
            secondTeamCountryCode: "FR"
        }
    })

    await prisma.game.create({
        data: {
            date: "2022-12-05T15:00:00.812Z",
            firstTeamCountryCode: "BR",
            secondTeamCountryCode: "AR",

            guesses: {
                create: {
                    firstTeamPoints: 3,
                    secondTeamPoints: 1,
                    participant: {
                        connect: {
                            userId_pollId: {
                                userId: user.id,
                                pollId: poll.id
                            }
                        }
                    }
                }
            }
        }
    })
}

main()