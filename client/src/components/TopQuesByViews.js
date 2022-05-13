import React,{useState,useEffect} from 'react';
import axios from 'axios';
import { BASE_URL } from "../utils/helperFuncs";
import { AreaChart, Area, YAxis, XAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const TopQuesByViews = () => {
  const [quesData, setQuesData] = useState(null);
  var chart_data=[]
  
    useEffect(()=>{

      axios.get(`${BASE_URL}/questions/getbyviews`)
    .then((res)=>{
      // console.log(`printing res.data`,res.data);
      const { data } = res;
      console.log(`printing data`,data);
      setQuesData(data);
      data.map((ques)=>{
        var views=ques.views
        var upvotes=ques.upvotedBy.length
        var obj={views,upvotes}
        chart_data.push(obj)
        console.log(`Hi`,chart_data)
      })
    })
    .catch((error)=>{
        console.log(error)
    })
    },[])
    console.log(`*`,quesData);
    
    console.log(`**`,chart_data)
    
    return (
        <div>
            
        </div>
    );
};

export default TopQuesByViews;