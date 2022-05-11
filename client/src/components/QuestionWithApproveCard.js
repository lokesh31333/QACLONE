import { Link as RouterLink } from "react-router-dom";
import PostedByUser from "./PostedByUser";
import axios from "axios";
import { Paper, Typography, Chip, Button } from "@material-ui/core";
import { useQuesCardStyles } from "../styles/muiStyles";
import { BASE_URL } from "../utils/helperFuncs";
import { useState } from "react";
import ErrorMessage from "../components/ErrorMessage";

import localStorage from "../utils/localStorage";

const QuestionWithApproveCard = ({ question, refetchPendingQuestions }) => {
  const classes = useQuesCardStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMsg] = useState();
  const { id, title, author, body, tags, createdAt } = question;

  const approveQuestion = async () => {
    try {
      setIsLoading(true);
      const loggedUser = localStorage.loadUser();
      if (!loggedUser) {
        throw new Error("Please login to view this page");
      }
      const getQuestions = await axios.put(
        `${BASE_URL}/questions/approve`,
        { quesId: id },
        {
          headers: {
            authorization: loggedUser.token,
          },
        }
      );
      const { data } = getQuestions;
      console.log(data.questions);
      setIsLoading(false);
      refetchPendingQuestions(1, 12);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      if (error && error.response) {
        setErrorMsg(error.response.data.message);
      } else if (error && error.message) {
        setErrorMsg(error.message);
      }
    }
  };

  return (
    <>
      <Paper elevation={0} className={classes.root}>
        <div className={classes.quesDetails}>
          <Typography
            variant="body2"
            color="secondary"
            className={classes.title}
            component={RouterLink}
            to={`/questions/${id}`}
          >
            {title}
          </Typography>
          <Typography variant="body2" style={{ wordWrap: "anywhere" }}>
            {body.length > 150 ? body.slice(0, 150) + "..." : body}
          </Typography>
          <div className={classes.bottomWrapper}>
            <div className={classes.tagsWrapper}>
              {tags.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  variant="outlined"
                  color="primary"
                  size="small"
                  component={RouterLink}
                  to={`/tags/${t}`}
                  className={classes.tag}
                  clickable
                />
              ))}
            </div>
            <PostedByUser
              username={author.username}
              userId={author.id}
              createdAt={createdAt}
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            size="small"
            disabled={isLoading}
            onClick={() => {
              approveQuestion();
            }}
            style={{ minWidth: "9em", color: "white" }}
          >
            Approve Question
          </Button>
        </div>
      </Paper>
      {errorMessage ? (
        <ErrorMessage
          errorMsg={errorMessage}
          clearErrorMsg={() => setErrorMsg(null)}
        />
      ) : null}
    </>
  );
};

export default QuestionWithApproveCard;
