import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField'
import Button from '@mui/material/Button';
import axios  from 'axios';
import { BASE_URL } from "../utils/helperFuncs";

import '../css/AddTag.css'

const AddTag = () => {

    const[tag,setTag]=useState({tag_name:'',tag_description:''});

    
    const handleChange=(e)=>{
        setTag({
            ...tag,
            [e.target.name]:e.target.value,
        })
    }

    const handleSubmit=(e)=>{
        e.preventDefault();
        console.log(tag)
        axios
        .post(`${BASE_URL}/tags/createtag`, tag)
        .then((response) => {console.log(`Tag added successfully`,response)
        alert(`Tag added successfully`);
        })
        .catch((e) => {
            console.error(e);
        });
    }

    return (
        <div>
        <div className='input'>
            <form noValidate >
            <TextField
            id ="tag_name" 
            name="tag_name" 
            placeholder="Tag Name" 
            type="tag_name"
            className="textField"
            variant="outlined"
            onChange={handleChange}            
            >
            </TextField>
            <TextField
            id ="tag_description" 
            name="tag_description" 
            placeholder="Tag Description" 
            type="tag_description"
            className="textField"
            variant="outlined"
            onChange={handleChange}
            >    
            </TextField>
            <Button  variant="contained" className='create-button'  onClick={handleSubmit}>Add Tag</Button>
            </form>
        </div>
        </div>
    );
};

export default AddTag;