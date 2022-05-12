import axios from "axios";
import {Link, Link as RouterLink} from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import {BASE_URL} from "../utils/helperFuncs";
import {Typography, Chip, useMediaQuery, Grid, Button} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";
import {
  useMenuStyles,
  useMessage,
  useMessageStyles,
  useQuesPageStyles,
  useRightSidePanelStyles
} from "../styles/muiStyles";
import {useEffect, useState} from "react";
import localStorage from "../utils/localStorage";
import {useStateContext} from "../context/state";
import DetailedChat from './DetailedChat';

const Chats = () => {
  const classes = useMessageStyles();
  const {notify} = useStateContext();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState(null);
  const [users, setUsers] = useState();
  const [allusers, setAllUsers] = useState();
  const loggedUser = localStorage.loadUser();

  const fetchAllTags = async () => {
    try {
      setIsLoading(true);
      const getUsersWhoMessaged = await axios.get(`${BASE_URL}/messages`, {
        headers: {
          authorization: loggedUser?.token,
        },
      });

      console.log("Messages====", getUsersWhoMessaged)
      setUsers(getUsersWhoMessaged.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  useEffect(() => {
    fetchAllTags().then(r => console.log("Response", r)).catch(err => console.log("Error", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("Current user!!", currentUser, users);
  }, [currentUser, users])

  useEffect(() => {
    const changeUserChat = async () => {
      const _allUsers = await axios.get(`${BASE_URL}/users/all`,  {
        headers: {
          authorization: loggedUser?.token
        }
      });
      console.log("All users====", _allUsers)
      setAllUsers(_allUsers.data)
    }

    changeUserChat().then((res) => console.log("res", res))
  }, [])

  const changeUserChat = async (user) => {
    console.log("Item cjlicked", user)
    const getConvo = await axios.post(`${BASE_URL}/messages/conversation`, {otherUser: user.id}, {
      headers: {
        authorization: loggedUser?.token
      }
    });
    console.log("Conversastion====", getConvo)
    setConversation(getConvo.data);
    setCurrentUser(user)
  }

  const addMessage = async () => {
    console.log("Add messgae", message)
    const getConvo = await axios.post(`${BASE_URL}/messages/add`, {
      receiver: currentUser.id,
      message,
      createdAt: new Date().toLocaleDateString("en-US"),
      sender: loggedUser.id
    }, {
      headers: {
        authorization: loggedUser?.token
      }
    });
    console.log("Adding chatss flow====", getConvo)
    // setConversation(getConvo.data);
  }

  const searchNewUsers = () => {
    // TODO: change to filter
    const filteredUsrs = []
    for(let i in allusers) {
      if(allusers[i].username.includes(search)) {
        filteredUsrs.push(allusers[i])
      }
    }
    console.log("Filtered", filteredUsrs)
    setUsers(old => [...old, ...filteredUsrs])
  }

  return (
    <div className={classes.root}>
      <Typography variant="h6" color="secondary">
        Messages
      </Typography>

      <div>
        <input onChange={(e) => setSearch(e.target.value)} type='text' placeholder='New Convo'/>
        <Button onClick={searchNewUsers}>Add New Chat</Button>
      </div>


      <div style={{float: "left"}}>
        {
          isLoading ? "Loading..." : users ? users.map((item, idx) => (
          <div style={{display: "flex", padding: "10px"}} key={idx}>
            <div onClick={() => changeUserChat(item)}>{item.username}</div>
          </div>
          )) : "No Previous Conversation"
        }
      </div>
      <div>
        <DetailedChat otherUser={currentUser} conversation={conversation}/>
        <div style={{position: "fixed", bottom: "0"}}>
          {
            currentUser ?
              <div>
                <input onChange={(e) => setMessage(e.target.value)} type='text' placeholder='Type a message'/>
                <Button onClick={addMessage}>Send Message</Button>

              </div> : ""
          }
        </div>
      </div>
    </div>
  );
};

export default Chats;
