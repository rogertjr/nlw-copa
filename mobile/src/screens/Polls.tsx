import { useState, useCallback } from "react"
import { api } from '../services/api'

import { VStack, Icon, useToast, FlatList } from "native-base"
import { Header } from "../components/Header"
import { Button } from "../components/Button"
import { PollCard, PollCardPros } from "../components/PollCard"
import { EmptyPollList } from "../components/EmptyPollList"
import { Loading } from "../components/Loading"
import { Fontisto } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

export function Polls() {
  const { navigate } = useNavigation()
  const [isLoading, setLoading] = useState(false)
  const [polls, setPolls] = useState<PollCardPros[]>([])
  const toast = useToast()

  async function fetchPolls() {
    try {
      setLoading(true)
      const response = await api.get('/polls')
      setPolls(response.data.polls)
    } catch (err) {
      console.log(err)
      toast.show({
        title: 'Não foi possível carregar os bolões',
        placement: 'top',
        bgColor: 'red.500'
      })
    } finally {
      setLoading(false)
    }
  }
  
  useFocusEffect(useCallback(() => {fetchPolls()}, []))

  return (
    <VStack flex={1} bgColor="gray.900">
        <Header title="Meus bolões"/>
        <VStack mt={6} mx={5} alignItems="center" borderBottomWidth={1} borderBottomColor="gray.600" pb={4} mb={4}>
            <Button 
              title="BUSCAR BOLÃO POR CÓDIGO" 
              leftIcon={ <Icon as={Fontisto} name="search" color="black" size="md" /> }
              onPress={ () => navigate('find')}  
            />
        </VStack>
        {
          isLoading 
            ? <Loading /> 
            : <FlatList 
                data={polls} 
                keyExtractor={item => item.id} renderItem={({item}) => (
                  <PollCard data={item} onPress={() => navigate('details', {id: item.id})}/>
                )} 
                px={5} 
                showsVerticalScrollIndicator={false} 
                _contentContainerStyle={{ pb: 10 }} 
                ListEmptyComponent={() => <EmptyPollList/>}
              />
        }
    </VStack>
  )
}