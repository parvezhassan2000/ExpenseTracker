import { createContext } from "react";

const AuthContext = createContext({
    token: '',
    email: '',
    isLoggedIn: false,
    signup: (() => {}),
    login: (() => {}),
    logout: (() => {}),
    updateUserProfile: (() => {}),
    getCurrentProfileData: (() => {})

});

export default AuthContext;