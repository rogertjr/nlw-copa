import { VStack, Icon } from "native-base"
import { Header } from "../components/Header"
import { Button } from "../components/Button"
import { Fontisto } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

export function Polls() {
  const { navigate } = useNavigation()
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
    </VStack>
  )
}