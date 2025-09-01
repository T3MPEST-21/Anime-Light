import { createContext, useState, ReactNode, useContext } from "react";

// Define the shape of your user object
interface User {
  id?: string;
  email?: string;
  full_name?: string;
  username?: string;
  favorite_anime?: string;
  [key: string]: any;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  setAuth: (authUser: User | null) => void;
  setUserData: (userData: User) => void;
}

// Create the context with an undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component to wrap your app
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Set the user object (e.g., after login/signup)
  const setAuth = (authUser: User | null) => {
    setUser(authUser);
  };

  // Update user data (e.g., after fetching profile)
  const setUserData = (userData: User) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);