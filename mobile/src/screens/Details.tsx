import { useEffect, useState } from "react"
import { api } from '../services/api'

import { VStack, useToast, HStack } from "native-base"
import { Share } from 'react-native'
import { Header } from "../components/Header"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Loading } from "../components/Loading"
import { PollCardPros } from '../components/PollCard'
import { PollHeader } from "../components/PollHeader"
import { EmptyMyPollList } from "../components/EmptyMyPollList"
import { Option } from "../components/Option"
import { Guesses } from "../components/Guesses"

interface RouteParams {
    id: string
}

export function Details() {
    const route = useRoute()
    const { id } = route.params as RouteParams
    const [ pollDetails, setPollDetails] = useState<PollCardPros>({} as PollCardPros)
    const [isLoading, setLoading] = useState(false)
    const [optionSelected, setOptionSelected] = useState<'guesses' | 'ranking'>('guesses')
    const toast = useToast()
    const { navigate } = useNavigation()

    async function handleCodeShare() {
        await Share.share({ message: pollDetails.code })
    }

    async function fetchPollDetail() {
        try {
            setLoading(true)
            const response = await api.get(`/polls/${id}`)
            setPollDetails(response.data.poll)
        } catch (err) {
            console.log(err)
            toast.show({
                title: 'Não foi possível carregar os detalhes do bolão',
                placement: 'top',
                bgColor: 'red.500'
              })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {fetchPollDetail()}, [id])

    if (isLoading) {
        return (<Loading/>)
    } else {
        return (
            <VStack flex={1} bgColor="gray.900">
                <Header title={pollDetails.title} showBackButton showShareButton onPress={handleCodeShare} />
                { 
                    pollDetails._count?.participants > 0 
                        ? 
                            <VStack px={5} flex={1}>
                                <PollHeader data={pollDetails} />
                                <HStack bgColor="gray.800" px={1} rounded="sm" mb={5}>
                                    <Option title="Seus palpites" isSelected={optionSelected === 'guesses'} onPress={() => setOptionSelected("guesses")} />
                                    <Option title="Ranking do grupo" isSelected={optionSelected === 'ranking'} onPress={() => setOptionSelected("ranking")} />
                                </HStack>
                                <Guesses  pollId={pollDetails.id} code={pollDetails.code} />
                            </VStack>
                        :
                        <EmptyMyPollList code={pollDetails.code} />
                }
            </VStack>
        )
    } 
}