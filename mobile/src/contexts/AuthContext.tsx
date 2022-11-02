import { createContext, ReactNode, useState, useEffect } from "react"
import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session'
import* as WebBrowser from 'expo-web-browser'

WebBrowser.maybeCompleteAuthSession()

interface UserProps {
    name: string,
    avatarUrl: string
}
interface AuthProviderProps {
    children: ReactNode
}
export interface AuthContextDataProps {
    user: UserProps,
    isUserLoading: boolean,
    signIn: () => Promise<void>
}

export const AuthContext = createContext({} as AuthContextDataProps);

export function AuthContextProvider({children}: AuthProviderProps) {
    const [isUserLoading, setIsUserLoading] = useState(false)
    const [user, setUser] = useState<UserProps>({} as UserProps)

    const [request, response, promptAsync] = Google.useAuthRequest({ 
        clientId: '896556385426-u72hhvbn6s5ohh175r3hudqmo1n36f0b.apps.googleusercontent.com',
        redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
        scopes: ['profile', 'email']
    })

    async function signIn() {
        try {
            setIsUserLoading(true)
            await promptAsync()
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            setIsUserLoading(false)
        }
    }

    async function signInWithGoogle(accessToken: string) {
        console.log(accessToken)
    }

    useEffect(() => {
        if (response?.type === 'success' && response.authentication?.accessToken) {
            signInWithGoogle(response.authentication.accessToken)
        }
    }, [response])

    return (
        <AuthContext.Provider value={{
            signIn,
            isUserLoading,
            user
        }}>
            { children }
        </AuthContext.Provider>
    );
}