import React from 'react';
import { Typography } from '@material-ui/core';
import '../css/UserBadges.css';

const UserBadges = ({ badges }) => {
    return (

        <div className="badges">
            <Typography variant="h6" color="primary">
                Badges
            </Typography>

            {
                badges !== undefined ? badges.filter(badge => badge.count !== 0).map((badge) => (
                    <button className="badges_button"
                        style={badge.badgeValue === "Gold" ? { backgroundColor: '#FFD700' } : badge.badgeValue === "Silver" ? { backgroundColor: 'BCBBBB' } : { backgroundColor: "#CD7F32" }}
                        key={badge.badgeName}> {badge.badgeName} </button>
                )) : "no badges"
            }
        </div>
    )
}

export default UserBadges