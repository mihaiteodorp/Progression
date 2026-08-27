

import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUserRequest, logoutRequest } from "../api/auth.js";

const AuthContext = createContext(null);
const authChannel = new BroadcastChannel('auth');

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function handleAuthMessage(event) {
            if (event.data.type === 'logout') {
                setUser(null);
                return;
            };
            if (event.data.type === 'login') {
                try {
                    const currentUser = await getCurrentUserRequest();
                    setUser(currentUser);
                } catch (error) {
                    console.log("Failed to sync login", error);
                    setUser(null);
                }
            }
        };

        authChannel.addEventListener('message', handleAuthMessage);

        return () => {
            authChannel.removeEventListener('message', handleAuthMessage);
        }


    }, [])

    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const currentUser = await getCurrentUserRequest();
                setUser(currentUser);
            } catch (error) {
                console.error('Failed to load current user:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            };

        };
        loadCurrentUser();
    }, [])

    function login(userData) {
        setUser(userData);
        authChannel.postMessage({
            type:'login'
        })
    }

    async function logout() {
        await logoutRequest();

        setUser(null);
        
        authChannel.postMessage({
            type:'logout'
        });
    }

    const value = {
        user,
        isLoading,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}

export function useAuth() {

    return useContext(AuthContext);
}