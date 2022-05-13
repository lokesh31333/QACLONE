import React from 'react'
import {Typography} from '@material-ui/core';
import '../css/Badges.css';

function Badges({badges}) {
  return (
    <div className="badges">
      <Typography variant="h6" color="primary">
        Badges
      </Typography>

      {
        badges !== [] ? badges.filter(badge => badge.level !== "Hide" ).map((badge) => (
          <button className="badges_button"
            style={badge.level === "Gold" ? {backgroundColor: 'yellow'} : badge.level === "Silver" ? {backgroundColor: 'white'} : {backgroundColor: "brown"}}
            key={badge.name}> {badge.name} </button>
        )) : "no badges"
      }
    </div>
  )
}

export default Badges
