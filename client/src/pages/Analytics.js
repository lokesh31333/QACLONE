import { Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

const Analytics = () => {
    return (
        <div>
            <Button variant="contained" className='create-button' component = {Link} to='/dashboard/questions/mostviewed'>View Most Viewed questions</Button>

            
        </div>
    );
};

export default Analytics;