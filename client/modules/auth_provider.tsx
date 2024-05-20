import React, { ReactNode, createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export type UserInfo = {
    username: string
    id: string
}

export const AuthContext = createContext<{
    isAuthenticated: boolean
    setIsAuthenticated: (value: boolean) => void
    user: UserInfo
    setUser: (value: UserInfo) => void
}>({
    isAuthenticated: false,
    setIsAuthenticated: (value: boolean) => { },
    user: { username: '', id: '' },
    setUser: (value: UserInfo) => { }
})

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserInfo>({ username: '', id: '' });
    const router = useRouter();

    useEffect(() => {
        const userInfo = localStorage.getItem('user_info');
        if (!userInfo) {
            if (window.location.pathname !== '/signup') {
                router.push('/login');
                return;
            }
        } else {
            const user: UserInfo = JSON.parse(userInfo);
            if (user) {
                setIsAuthenticated(true);
                setUser(user);
            }
        }
    }, [isAuthenticated]);



    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}