import React from 'react';
import { Link } from 'react-router-dom';
import './profile.css'; // Optional: for styling

function IncompleteProfile() {
  return (
    <div className="incomplete-profile-banner">
      <div className="banner-content">
        <span className="welcome-text">Welcome to Expense Tracker!!!</span>
        <div className="profile-status">
          <span>Your profile is Incomplete.</span>
          <Link to="/profile/complete" className="complete-link">
            Complete now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default IncompleteProfile;