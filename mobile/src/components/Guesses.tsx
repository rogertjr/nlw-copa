import { useEffect, useState } from "react"
import { api } from '../services/api'

import { useToast, FlatList } from "native-base"
import { Game, GameProps } from '../components/Game'
import { Loading } from "./Loading";
import { EmptyMyPollList } from "./EmptyMyPollList";

interface Props {
  pollId: string;
  code: string;
}

export function Guesses({ pollId, code }: Props) {
  const [isLoading, setLoading] = useState(false)
  const [games, setGames] = useState<GameProps[]>([])
  const [firstTeamPoints, setFirstTeamPoints] = useState('')
  const [secondTeamPoints, setSecondTeamPoints] = useState('')
  const toast = useToast()

  async function fetchGames() {
    try {
        setLoading(true)
        const response = await api.get(`/polls/${pollId}/games`)
        setGames(response.data.games)
    } catch (err) {
        console.log(err)
        toast.show({
            title: 'Não foi possível carregar os jogos',
            placement: 'top',
            bgColor: 'red.500'
          })
    } finally {
        setLoading(false)
    }
  }

  async function handleGuess(gameId: string) {
    try {
      if(!firstTeamPoints.trim() || !secondTeamPoints.trim()) {
        return toast.show({
          title: 'Informe o placar para o jogo',
          placement: 'top',
          bgColor: 'red.500'
        })  
      }

      setLoading(true)
      await api.post(`/polls/${pollId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints)
      })

      toast.show({
        title: 'Palpite realizado com sucesso',
        placement: 'top',
        bgColor: 'green.500'
      }) 

      fetchGames()
    } catch (err) {
        console.log(err.message)
        toast.show({
            title: 'Não foi possível enviar o palpite',
            placement: 'top',
            bgColor: 'red.500'
          })
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {fetchGames()}, [pollId])
 
  if (isLoading) {
    return(<Loading/>)
  } else {
    return (
      <FlatList 
        data={games} 
        keyExtractor={item => item.id} 
        renderItem={({item}) => (
          <Game 
            data={item} 
            setFirstTeamPoints={setFirstTeamPoints} 
            setSecondTeamPoints={setSecondTeamPoints}
            onGuessConfirm={() => {handleGuess(item.id)}}
            />
        )}
        _contentContainerStyle={{ pb: 30 }}
        ListEmptyComponent={() => <EmptyMyPollList code={code} />}
      />
    )
  }
}
