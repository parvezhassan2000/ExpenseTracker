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
    async function getCurrentProfileData() {
        if (!token) {
            return { success: false, message: 'No token available' };
        }
    
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyASUQKY0hpH3Tp-GMyT3Ud-IKMoVZDG3G0`;
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token })
            });
    
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Failed to get profile');
    
            const user = data.users[0];
            const profileComplete = user.displayName && user.photoUrl;
            
            return {
                success: true,
                profileComplete: !!profileComplete,
                profileData: {
                    fullName: user.displayName || '',
                    profilePhotoUrl: user.photoUrl || ''
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Login Handler
    async function loginHandler(email, password) {
        // ✅ FIXED URL (no spaces!)
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyASUQKY0hpH3Tp-GMyT3Ud-IKMoVZDG3G0`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, returnSecureToken: true })
            });
    
            const data = await response.json();
            if (!response.ok) throw new Error(data.error.message || 'Login failed');
    
            setToken(data.idToken);
            setEmail(data.email);
            localStorage.setItem('token', data.idToken);
            localStorage.setItem('email', data.email);
    
            // ✅ Use single function for profile check
            const profileResult = await getCurrentProfileData();
            
            return { 
                success: true,
                profileComplete: profileResult.profileComplete
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
     // NEW: Update User Profile Handler using Firebase REST API
     async function updateUserProfile(userData) {
        if (!token) {
            throw new Error('No authentication token available');
        }
    
        // ✅ FIXED: No spaces in URL
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyASUQKY0hpH3Tp-GMyT3Ud-IKMoVZDG3G0`;
    
        try {
            const requestBody = {
                idToken: token,
                displayName: userData.fullName,
                photoUrl: userData.profilePhotoUrl,
                returnSecureToken: true
            };
    
            // Remove undefined values
            Object.keys(requestBody).forEach(key => {
                if (requestBody[key] === undefined || requestBody[key] === null) {
                    delete requestBody[key];
                }
            });
    
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
    
            const responseData = await response.json();
    
            if (!response.ok) {
                throw new Error(responseData.error?.message || 'Failed to update profile');
            }
    
            // Update local state
            if (responseData.displayName) {
                setEmail(responseData.email || email);
            }
    
            return {
                success: true,
                message: 'Profile updated successfully!',
                data: responseData
            };
    
        } catch (error) {
            console.error('Error updating profile:', error);
            return {
                success: false,
                message: error.message
            };
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
        logout: logoutHandler,
        updateUserProfile: updateUserProfile,
        getCurrentProfileData: getCurrentProfileData

    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;