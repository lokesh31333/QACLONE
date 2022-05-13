import React,{useState,useEffect} from 'react';
import axios from 'axios';
import { BASE_URL } from "../utils/helperFuncs";
import { AreaChart, Area, YAxis, XAxis, CartesianGrid, Tooltip, Legend,ResponsiveContainer,LineChart,Line } from 'recharts';

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
        var ques_id=ques._id;
        var obj={views,upvotes,ques_id}
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
        Hello
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={chart_data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ques_id" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="views" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="upvotes" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
      </div>
    );
};

export default TopQuesByViews;