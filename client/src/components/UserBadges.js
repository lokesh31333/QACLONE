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
                        style={badge.badgeValue === "Gold" ?
                            (badge.type === "tag" ? { backgroundColor: '#FFD700', color: "#000000" } : { backgroundColor: '#FFD700' }) :
                            badge.badgeValue === "Silver" ? (badge.type === "tag" ? { backgroundColor: 'BCBBBB', color: "#000000" } : { backgroundColor: 'BCBBBB' }) :
                                (badge.type === "tag" ? { backgroundColor: '#CD7F32', color: "#000000" } : { backgroundColor: '#CD7F32' })}
                        key={badge.badgeName}> {badge.badgeName} </button>
                )) : "no badges"
            }
        </div>
    )
}

export default UserBadges