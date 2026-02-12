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
            await sendEmailVerification(data.idToken);

            return { success: true, message: 'Signup successful!' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    // Add this function to your AuthProvider.jsx
async function sendPasswordResetEmail(email) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyASUQKY0hpH3Tp-GMyT3Ud-IKMoVZDG3G0`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requestType: "PASSWORD_RESET",
                email: email
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            // Handle specific Firebase error codes
            const errorMessage = data.error?.message || 'Failed to send password reset email';
            
            switch (errorMessage) {
                case 'EMAIL_NOT_FOUND':
                    throw new Error('No account found with this email address.');
                case 'INVALID_EMAIL':
                    throw new Error('Please enter a valid email address.');
                default:
                    throw new Error(errorMessage);
            }
        }

        return { 
            success: true, 
            message: 'Password reset link sent successfully!' 
        };

    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { 
            success: false, 
            message: error.message || 'Failed to send password reset email. Please try again.'
        };
    }
}


    async function sendEmailVerification(idToken) {
        // ✅ FIXED URL - no spaces
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyASUQKY0hpH3Tp-GMyT3Ud-IKMoVZDG3G0`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestType: "VERIFY_EMAIL",
                    idToken: idToken
                })
            });
    
            // ✅ CHECK RESPONSE STATUS (required by Firebase docs)
            const data = await response.json();
            
            if (!response.ok) {
                // Handle specific error codes from Firebase documentation
                const errorMessage = data.error?.message || 'Failed to send verification email';
                
                switch (errorMessage) {
                    case 'INVALID_ID_TOKEN':
                        throw new Error('Your session has expired. Please log in again.');
                    case 'USER_NOT_FOUND':
                        throw new Error('User account not found.');
                    default:
                        throw new Error(errorMessage);
                }
            }
    
            return { success: true, message: 'Verification email sent!' };
            
        } catch (error) {
            console.error('Failed to send verification email:', error);
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
                userData: user, // ✅ Include full user data including emailVerified

                profileData: {
                    fullName: user.displayName || '',
                    profilePhotoUrl: user.photoUrl || ''
                }
            };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    // Add this function for resending verification emails
async function resendVerificationEmail() {
    if (!token) {
        return { success: false, message: 'Not logged in' };
    }
    
    try {
        await sendEmailVerification(token);
        return { success: true, message: 'Verification email sent!' };
    } catch (error) {
        return { success: false, message: 'Failed to send verification email' };
    }
}




 // Replace your existing loginHandler with this:
async function loginHandler(email, password) {
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

        // ✅ CHECK IF EMAIL IS VERIFIED
        const profileResult = await getCurrentProfileData();
        
        // Get email verification status from the lookup API
        const user = profileResult.userData; // We'll modify getCurrentProfileData to return this
        
        if (user && !user.emailVerified) {
            // Email not verified - require verification first
            return { 
                success: false, 
                requiresVerification: true,
                message: 'Please verify your email address before logging in.'
            };
        }

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
        getCurrentProfileData: getCurrentProfileData,
        resendVerificationEmail: resendVerificationEmail,
        sendPasswordResetEmail:sendPasswordResetEmail


    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;