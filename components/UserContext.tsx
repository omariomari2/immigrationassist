import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, SignupData } from '../userTypes';
import { getCurrentUser, loginUser, signupUser, logoutUser, updateUser } from '../services/userService';

interface UserContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => { success: boolean; error?: string };
    signup: (data: SignupData) => { success: boolean; error?: string };
    logout: () => void;
    update: (updates: Partial<User>) => { success: boolean; error?: string };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = getCurrentUser();
        setUser(storedUser);
        setIsLoading(false);
    }, []);

    const login = (credentials: LoginCredentials) => {
        const result = loginUser(credentials);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return { success: result.success, error: result.error };
    };

    const signup = (data: SignupData) => {
        const result = signupUser(data);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return { success: result.success, error: result.error };
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    const update = (updates: Partial<User>) => {
        if (!user) {
            return { success: false, error: 'No user logged in' };
        }
        const result = updateUser(user.id, updates);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return { success: result.success, error: result.error };
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                logout,
                update
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
