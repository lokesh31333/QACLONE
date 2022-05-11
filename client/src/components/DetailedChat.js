import {useLocation} from "react-router-dom";
import {Button, Typography} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";
import {useRightChatPanel} from "../styles/muiStyles";
import {useEffect, useState} from "react";
import localStorage from "../utils/localStorage";
import {useStateContext} from "../context/state";
import axios from 'axios';
import {BASE_URL} from '../utils/helperFuncs';

const DetailedChat = ({otherUser, conversation}) => {
  const classes = useRightChatPanel();
  const theme = useTheme();
  const {notify} = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState();
  const [message, setMessage] = useState();
  const [allMessages, setAllMessages] = useState();
  const loggedUser = localStorage.loadUser();

  useEffect(async () => {
    console.log("get user convo===", otherUser)
    console.log("get user convo===", conversation)
    console.log("logged user===", loggedUser)
  }, [conversation]);

  // const addMessage = () => {
  //   console.log("Message", message)
  //   setAllMessages(old => [...old, message])
  //   console.log("All messages", allMessages)
  //   setMessage("")
  // }

  return (
    <div>
      {otherUser ?
        <div>
        <h4>{otherUser.username}</h4>
        <div>
          {
            conversation ? conversation.map((line) => (
              <div style={loggedUser.id === line.receiver[0] ? {float: "right", width: "70%"} : {
                float: "left",
                width: "70%"
              }}>
                <h6>{line.receiver[0]}</h6>
                <h6>{line.sender[0]}</h6>
                <h6>{(loggedUser.id === line.receiver[0]).toString()}</h6>
                <h3>{line.message}</h3>
              </div>
            )) : "Select a user!!"
          }
        </div>
        </div>: ""
      }

    </div>

  );
};

export default DetailedChat;
