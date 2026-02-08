import { useState, useEffect } from "react";
import AuthContext from "./auth-context";
import React from 'react';

function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedEmail = localStorage.getItem('email');
        if (storedToken) {
            setToken(storedToken);
            setEmail(storedEmail);
        }
    }, []);

    const isLoggedIn = !!token;

    // Signup Handler
    async function signupHandler(email, password) {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyASUQKY0hpH3Tp-GMyT3Ud-IKMoVZDG3G0`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error.message || 'Signup failed');
            }

            // Store token and email
            setToken(data.idToken);
            setEmail(data.email);
            localStorage.setItem('token', data.idToken);
            localStorage.setItem('email', data.email);

            return { success: true, message: 'Signup successful!' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Login Handler
    async function loginHandler(email, password) {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyASUQKY0hpH3Tp-GMyT3Ud-IKMoVZDG3G0`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error.message || 'Login failed');
            }

            // Store token and email
            setToken(data.idToken);
            setEmail(data.email);
            localStorage.setItem('token', data.idToken);
            localStorage.setItem('email', data.email);

            return { success: true, message: 'Login successful!' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Logout Handler
    function logoutHandler() {
        setToken(null);
        setEmail('');
        localStorage.removeItem('token');
        localStorage.removeItem('email');
    }

    const contextValue = {
        token: token,
        email: email,
        isLoggedIn: isLoggedIn,
        signup: signupHandler,
        login: loginHandler,
        logout: logoutHandler
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;