import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link as RouterLink } from "react-router-dom";
import RecentQuestions from "../components/RecentQuestions";
import LoadingSpinner from "../components/LoadingSpinner";
import { useStateContext } from "../context/state";
import { BASE_URL, formatDateAgo } from "../utils/helperFuncs";

import { Avatar, Typography, Divider } from "@material-ui/core";
import { useUserPageStyles } from "../styles/muiStyles";
import Button from '@mui/material/Button';
import { Link ,Outlet} from 'react-router-dom'
import '../css/Admin.css'
const UserPage = () => {
  const classes = useUserPageStyles();
  const { notify } = useStateContext();
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedUser, setFetchedUser] = useState(null);
  var flag=false; //To handle if user is admin
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const getUser = await axios.get(`${BASE_URL}/users/${username}`);
        const { data } = getUser;
        setIsLoading(false);
        setFetchedUser(data);
        console.log(data.role);
        if(data.role=='admin'){
          flag=true;
          console.log(`Logged in user is Admin`,flag);
        }

      } catch (error) {
        console.log(error);
        setIsLoading(false);
        if (error && error.response) {
          notify(error.response.data.message, "error");
        }
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (isLoading || !fetchedUser) {
    return (
      <div style={{ minWidth: "100%", marginTop: "20%" }}>
        <LoadingSpinner size={80} />
      </div>
    );
  }

  const {
    id,
    username: userName,
    role,
    createdAt,
    reputation,
    totalQuestions,
    totalAnswers,
    recentQuestions,
    recentAnswers,
  } = fetchedUser;

  const badgeMap = {
    Gold: "/static/gold-badge.png",
    Silver: "/static/silver-badge.png",
    Bronze: "/static/bronze-badge.png",
  };

  if(fetchedUser.role=='admin'){
    flag=true;
    console.log(`Logged in user is Admin`,flag);
  }

  return (
    <div className={classes.root}>
      <div className={classes.userCard}>
        <Avatar
          src={`https://secure.gravatar.com/avatar/${id}?s=164&d=identicon`}
          alt={username}
          className={classes.avatar}
          component={RouterLink}
          to={`/user/${username}`}
        />
        <Typography variant="h5" color="secondary" className={classes.cardText}>
          {reputation} <Typography variant="caption">REPUTATION</Typography>
        </Typography>
        {fetchedUser.badge && fetchedUser.badge !== "No Badge" && (
          <Avatar
            src={badgeMap[fetchedUser.badge]}
            className={classes.avatar}
          />
        )}
      </div>
      <div className={classes.infoCard}>
        <div className={classes.userInfo}>
          <div>
            <Typography
              variant="h4"
              color="primary"
              className={classes.bigText}
            >
              {userName}
            </Typography>
            <Typography
              variant="body1"
              color="secondary"
              className={classes.smallText}
            >
              member for {formatDateAgo(createdAt)}
            </Typography>
          </div>
          <div className={classes.statsBar}>
            <div style={{ marginRight: 10 }}>
              <Typography
                variant="h4"
                color="primary"
                className={classes.bigText}
              >
                {totalAnswers}
              </Typography>
              <Typography
                variant="body1"
                color="secondary"
                className={classes.smallText}
              >
                answers
              </Typography>
            </div>
            <div>
              <Typography
                variant="h4"
                color="primary"
                className={classes.bigText}
              >
                {totalQuestions}
              </Typography>
              <Typography
                variant="body1"
                color="secondary"
                className={classes.smallText}
              >
                questions
              </Typography>
            </div>
          </div>
        </div>
        <Divider />
        <div className={classes.recentActivity}>
          <div style={{ marginBottom: "1em" }}>
            <Typography variant="h6" color="primary">
              Last Asked Questions
            </Typography>
            <Divider />
            {recentQuestions.length !== 0 ? (
              recentQuestions.map((q) => (
                <div key={q.id}>
                  <RecentQuestions question={q} />
                  <Divider />
                </div>
              ))
            ) : (
              <Typography variant="subtitle1">
                No questions asked yet.
              </Typography>
            )}
          </div>
          <div>
            <Typography variant="h6" color="primary">
              Last Answered Questions
            </Typography>
            <Divider />
            {recentAnswers.length !== 0 ? (
              recentAnswers.map((q) => (
                <div key={q.id}>
                  <RecentQuestions question={q} />
                  <Divider />
                </div>
              ))
            ) : (
              <Typography variant="subtitle1">
                No questions answered yet.
              </Typography>
            )}
          </div>
        </div>
      </div>
      
     {(flag && (<div className='admin'>
            <Button  variant="contained" className='create-button'  component = {Link} to={`/user/${username}/addtag`}>Add Tags</Button>
            <Button variant="contained" className='create-button'  component = {Link} to={`/user/${username}/review`}>Review</Button>
            <Button variant="contained" className='create-button' component = {Link} to={`/user/${username}/dashboard`}>Dashboard</Button>
        </div>))}
    </div>
  );
};

export default UserPage;
