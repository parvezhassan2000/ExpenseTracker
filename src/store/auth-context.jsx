import { createContext } from "react";

const AuthContext = createContext({
    token: '',
    email: '',
    isLoggedIn: false,
    signup: (() => {}),
    login: (() => {}),
    logout: (() => {}),
    updateUserProfile: (() => {})
});

export default AuthContext;