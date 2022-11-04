import { useState } from "react"
import { api } from '../services/api'

import { VStack, Heading, useToast } from "native-base"
import { Header } from "../components/Header"
import { Input } from "../components/Input"
import { Button } from "../components/Button"
import { useNavigation } from "@react-navigation/native"

export function Find() {
  const [code, setCode] = useState('')
  const [isLoading, setLoading] = useState(false)
  const toast = useToast()
  const { navigate } = useNavigation()

  async function handleJoinPoll() {
    if (!code.trim()) {
      return toast.show({
        title: 'Informe o código do bolão',
        placement: 'top',
        bgColor: 'red.500'
      })
    }

    try {
      setLoading(true)
      await api.post('/polls/join', {code})

      toast.show({
        title: 'Voce entrou no bolão com sucesso',
        placement: 'top',
        bgColor: 'green.500'
      })

      navigate('polls')
    } catch (err) {
      setLoading(false)
      console.log(err)
      if (err.response?.data?.message === 'Poll not found') {
        return toast.show({
          title: 'Não foi possível encontrar o bolão',
          placement: 'top',
          bgColor: 'red.500'
        })
      }

      if (err.response?.data?.message === 'Poll already joined') {
        return toast.show({
          title: 'Voce já esta neste bolão',
          placement: 'top',
          bgColor: 'red.500'
        })
      }
    }
  }

  return (
    <VStack flex={1} bgColor="gray.900">
        <Header title="Buscar por código" showBackButton/>
        <VStack mt={8} mx={5} alignItems="center">
            <Heading 
              fontFamily="heading" 
              color="white" 
              fontSize="xl" 
              mb={8} 
              textAlign="center"
            >
              Encontre um bolão através de{'\n'} seu código único
            </Heading>
            <Input mb={2} placeholder="Qual o código do bolão?" autoCapitalize="characters" onChangeText={setCode} value={code} />
            <Button title="BUSCAR BOLÃO" onPress={handleJoinPoll} isLoading={isLoading} />
        </VStack>
    </VStack>
  )
}