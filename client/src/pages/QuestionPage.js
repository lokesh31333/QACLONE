import axios from "axios";
import { useState, useEffect } from "react";
import { BookmarkButton } from '../components/Bookmarkbutton';
import { useParams, Link as RouterLink } from "react-router-dom";
import { useStateContext } from "../context/state";
import { useAuthContext } from "../context/auth";
import QuesPageContent from "../components/QuesPageContent";
import RightSidePanel from "../components/RightSidePanel";
import AuthFormModal from "../components/AuthFormModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { BASE_URL, formatDateAgo } from "../utils/helperFuncs";
import jwt_decode from "jwt-decode";

import {
  Typography,
  Button,
  Divider,
  Grid,
  useMediaQuery,
} from "@material-ui/core";
import { useQuesPageStyles } from "../styles/muiStyles";
import { useTheme } from "@material-ui/core/styles";
import localStorage from "../utils/localStorage";



const QuestionPage = () => {
  const { clearEdit, notify } = useStateContext();
  const { user } = useAuthContext();
  const { quesId } = useParams();
  const [question, setQuestion] = useState(null);
  const [ques, setQues] = useState({quesId:""});
  const [isLoading, setIsLoading] = useState(true);
  const classes = useQuesPageStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const [updatedQuestion, setUpdatedQuestion] = useState(question);
  

  
  // const [fetchQuestion, { data, loading }] = useLazyQuery(VIEW_QUESTION, {
  //   onError: (err) => {
  //     notify(getErrorMsg(err), 'error');
  //   },
  // });

  // useEffect(() => {
  //   fetchQuestion({ variables: { quesId } });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [quesId]);

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        setIsLoading(true);
        setQues({quesId:quesId});
        const loggedUser = localStorage.loadUser();
        const getQuestion = await axios.get(`${BASE_URL}/questions/get`, {
          params: { quesId },
          headers: {
            authorization: loggedUser.token,
          },
        });
        const { data } = getQuestion;
        setIsLoading(false);
        setQuestion(data);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
        if (error && error.response) {
          notify(error.response.data.message, "error");
        }
      }
    };
    fetchAllTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quesId]);

  if (isLoading || !question) {
    return (
      <div style={{ minWidth: "100%", marginTop: "20%" }}>
        <LoadingSpinner size={80} />
      </div>
    );
  }
  const bookmarkQuestion = async (quesId,res)=>{
    console.log("inside bookmark question  =>"+JSON.stringify(ques))
      const loggedUser = localStorage.loadUser();
      var decoded = jwt_decode(loggedUser.token);
      console.log(decoded);
      const updatedQuestion = await 
      axios.post(
        `${BASE_URL}/users/bookmarks`,
        { ques },
        {
          headers: {
            authorization: decoded.id,
          },
        }
        )
      // axios.post(url,ques,{headers: authorization:loggedUser?.token})
      .then((response) => {
        console.log(`Bookmark question successful`,res);
        
    })
    .catch((e) => {
      console.error(e);
      console.log(`Bookmark unsuccessful`,e);
  });
}

  // const bookmarkQues = () => {
  //   bookmarkQuestion(quesId);
  // };

  const { title, views, createdAt, updatedAt } = question;

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <div className={classes.titleWrapper}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            color="secondary"
            style={{ wordWrap: "anywhere" }}
          >
            {title}
          </Typography>
          {user ? (
            <Button
              variant="contained"
              color="primary"
              size={isMobile ? "small" : "medium"}
              component={RouterLink}
              to="/ask"
              onClick={() => clearEdit()}
              style={{ minWidth: "9em" }}
            >
              Ask Question
            </Button>
          ) : (
            <AuthFormModal buttonType="ask" />
          )}
        </div>
        
        <div className={classes.quesInfo}>
          <Typography variant="caption" style={{ marginRight: 10 }}>
            Asked <strong>{formatDateAgo(createdAt)} ago</strong>
          </Typography>
          {createdAt !== updatedAt && (
            <Typography variant="caption" style={{ marginRight: 10 }}>
              Edited <strong>{formatDateAgo(updatedAt)} ago</strong>
            </Typography>
          )}
          <Typography variant="caption">
            Viewed <strong>{views.length} times</strong>
          </Typography>
        </div>
        <div>
        {user ? (
          <BookmarkButton
            // checked={user ? upvotedBy.includes(user.id) : false}
            user={user}
            
            handlebookmark={bookmarkQuestion}
          />
        ) : (
          <AuthFormModal buttonType="bookmark" />
        )}
        </div>
      </div>
      <Divider />
      <Grid container direction="row" wrap="nowrap" justify="space-between">
        <QuesPageContent question={question} />
        <RightSidePanel />
      </Grid>
    </div>
  );
};

export default QuestionPage;
