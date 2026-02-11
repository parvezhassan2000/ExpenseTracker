import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../store/auth-context';
import './profile.css';

function CompleteProfile() {
    const [formData, setFormData] = useState({
        fullName: '',
        profilePhotoUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const authCtx = useContext(AuthContext);
    const navigate = useNavigate();

    // ✅ Load existing profile data on component mount
    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const result = await authCtx.getCurrentProfileData();
                if (result.success) {
                    setFormData(result.profileData);
                    console.log('Your Profile Data:', result.profileData);

                }
            } catch (err) {
                console.error('Error loading profile:', err);
            }
        };
        loadProfileData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await authCtx.updateUserProfile(formData);
            
            if (result.success) {
                setSuccess('Profile updated successfully!');
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setError(result.message || 'Failed to update profile');
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="complete-profile-container">
            <div className="profile-progress-banner">
                <span>Your Profile is <strong>64% completed</strong>. A complete Profile has higher chances of landing a job.</span>
                <button className="cancel-link" onClick={handleCancel}>Cancel</button>
            </div>

            <div className="complete-profile-card">
                <h2>Contact Details</h2>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* ✅ Single form for profile completion */}
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-field">
                            <label>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                Full Name:
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Enter full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                autoComplete="name" // ✅ Added per guidelines
                            />
                        </div>

                        <div className="form-field">
                            <label>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <path d="M21 15l-5 5v-5"></path>
                                </svg>
                                Profile Photo URL:
                            </label>
                            <input
                                type="url"
                                name="profilePhotoUrl"
                                placeholder="https://example.com/photo.jpg"
                                value={formData.profilePhotoUrl}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="photo" // ✅ Added per guidelines
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="btn-update"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CompleteProfile;