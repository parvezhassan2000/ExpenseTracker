// src/components/Navigation.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../store/auth-context';
import './Navigation.css';

function Navigation() {
    const authCtx = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        authCtx.logout();
        navigate('/login');
    };

    // Only show navigation when user is logged in
    if (!authCtx.isLoggedIn) {
        return null;
    }

    return (
        <nav className="app-navigation">
            <div className="nav-container">
                <button 
                    onClick={handleLogout}
                    className="logout-button"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navigation;