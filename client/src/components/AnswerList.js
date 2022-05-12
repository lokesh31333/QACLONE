import { useEffect, useState } from "react";
import axios from "axios";
import QuesAnsDetails from "./QuesAnsDetails";
import SortAnsBar from "./SortAnsBar";
import { useStateContext } from "../context/state";
import sortAnswers from "../utils/sortAnswers";
import { BASE_URL } from "../utils/helperFuncs";

import { Typography, useMediaQuery, Divider } from "@material-ui/core";
import { useQuesPageStyles } from "../styles/muiStyles";
import { useTheme } from "@material-ui/core/styles";
import localStorage from "../utils/localStorage";
import parse from 'html-react-parser'

const AnswerList = ({ quesId, answers, acceptedAnswer, quesAuthor }) => {
  const { notify } = useStateContext();
  const classes = useQuesPageStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const [sortBy, setSortBy] = useState("VOTES");
  const [updatedAnswers, setUpdatedAnswers] = useState(answers);

  useEffect(() => {
    setUpdatedAnswers(answers);
  }, [answers]);

  const voteAsnwer = async (quesId, ansId, voteType) => {
    try {
      const loggedUser = localStorage.loadUser();
      const updatedAnswer = await axios.put(
        `${BASE_URL}/answers/vote`,
        { quesId, ansId, voteType },
        {
          headers: {
            authorization: loggedUser.token,
          },
        }
      );
      setUpdatedAnswers(updatedAnswer.data.answers);
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const updateAnswer = async (quesId, ansId, body) => {
    try {
      const loggedUser = localStorage.loadUser();
      const updatedAnswerList = await axios.put(
        `${BASE_URL}/answers/update`,
        { quesId, body, ansId },
        {
          headers: {
            authorization: loggedUser.token,
          },
        }
      );
      setUpdatedAnswers(updatedAnswerList.data);
      notify("Comment updated!");
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const acceptAnswer = async (quesId, ansId) => {
    try {
      const loggedUser = localStorage.loadUser();
      const updatedQuestion = await axios.put(
        `${BASE_URL}/answers/accept`,
        { quesId, ansId },
        {
          headers: {
            authorization: loggedUser.token,
          },
        }
      );
      setUpdatedAnswers(updatedQuestion.data.answers);
      notify("Accepted the answer!");
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const removeAnswer = async (quesId, ansId) => {
    try {
      const loggedUser = localStorage.loadUser();
      await axios.delete(`${BASE_URL}/answers/${quesId}/${ansId}`, {
        headers: {
          authorization: loggedUser.token,
        },
      });
      const updatedList = updatedAnswers.filter((item) => item.id != ansId);
      setUpdatedAnswers(updatedList);
      notify("Answer Deleted");
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const removeAnswerComment = async (quesId, ansId, commentId) => {
    try {
      const loggedUser = localStorage.loadUser();
      await axios.delete(
        `${BASE_URL}/answer-comments/${quesId}/${ansId}/${commentId}`,
        {
          headers: {
            authorization: loggedUser.token,
          },
        }
      );
      const answer = updatedAnswers.filter((item) => item.id === quesId);
      const index = updatedAnswers.findIndex((item) => item.id === quesId);
      const updatedListOfComments =
        answer.comments && answer.comments.length > 1
          ? answer.comments.filter((item) => item.id != ansId)
          : [];
      answer.comments = updatedListOfComments;
      const updatedAnswersList = [...updatedAnswers];
      updatedAnswersList[index] = answer;
      setUpdatedAnswers(updatedAnswersList);
      notify("Comment Deleted");
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const addAnswerComment = async (quesId, ansId, body) => {
    try {
      const loggedUser = localStorage.loadUser();
      const newComments = await axios.post(
        `${BASE_URL}/answer-comments/new`,
        { quesId, body, ansId },
        {
          headers: {
            authorization: loggedUser.token,
          },
        }
      );
      const answer = updatedAnswers.filter((item) => item.id === quesId);
      const index = updatedAnswers.findIndex((item) => item.id === quesId);

      answer.comments = newComments;
      const updatedAnswersList = [...updatedAnswers];
      updatedAnswersList[index] = answer;
      setUpdatedAnswers(updatedAnswersList);
      notify("Comment Added");
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const editAnswerComment = async (quesId, ansId, body, commentId) => {
    try {
      const loggedUser = localStorage.loadUser();
      const newComments = await axios.put(
        `${BASE_URL}/answer-comments/update`,
        { quesId, body, ansId, commentId },
        {
          headers: {
            authorization: loggedUser.token,
          },
        }
      );
      const answer = updatedAnswers.filter((item) => item.id === quesId);
      const index = updatedAnswers.findIndex((item) => item.id === quesId);

      answer.comments = newComments;
      const updatedAnswersList = [...updatedAnswers];
      updatedAnswersList[index] = answer;
      setUpdatedAnswers(updatedAnswersList);
      notify("Comment Updated");
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const upvoteAns = (ansId, upvotedBy, downvotedBy) => {
    voteAsnwer(quesId, ansId, "UPVOTE");
  };

  const downvoteAns = (ansId, upvotedBy, downvotedBy) => {
    voteAsnwer(quesId, ansId, "DOWNVOTE");
  };

  const editAns = (editedAnswerBody, ansId) => {
    updateAnswer(quesId, ansId, editedAnswerBody);
  };

  const deleteAns = (ansId) => {
    removeAnswer(quesId, ansId);
  };

  const acceptAns = (ansId) => {
    acceptAnswer(quesId, ansId);
  };

  const addAnsComment = (commentBody, ansId) => {
    addAnswerComment(quesId, ansId, commentBody);
  };

  const editAnsComment = (editedCommentBody, commentId, ansId) => {
    editAnswerComment(quesId, ansId, editedCommentBody, commentId);
  };

  const deleteAnsComment = (commentId, ansId) => {
    removeAnswerComment(quesId, ansId, commentId);
  };
  console.log("new", updatedAnswers, answers);
  const answerList = sortAnswers(sortBy, updatedAnswers, acceptedAnswer);

  return (
    <div className={classes.answersWrapper}>
      {answerList.length !== 0 && (
        <div className={classes.answerHeader}>
          <Typography color="secondary" variant="h6">
            {answerList.length} {answerList.length === 1 ? "Answer" : "Answers"}
          </Typography>
          <SortAnsBar
            sortBy={sortBy}
            setSortBy={setSortBy}
            isMobile={isMobile}
          />
        </div>
      )}
      <div>
        {answerList.map((a) => (
          <div key={a.id} className={classes.answerWrapper}>
            <QuesAnsDetails
              quesAns={a}
              upvoteQuesAns={() => upvoteAns(a.id, a.upvotedBy, a.downvotedBy)}
              downvoteQuesAns={() =>
                downvoteAns(a.id, a.upvotedBy, a.downvotedBy)
              }
              editQuesAns={editAns}
              deleteQuesAns={() => deleteAns(a.id)}
              acceptAnswer={() => acceptAns(a.id)}
              addComment={addAnsComment}
              editComment={editAnsComment}
              deleteComment={deleteAnsComment}
              isAnswer={true}
              acceptedAnswer={acceptedAnswer}
              quesAuthor={quesAuthor}
            />
            <Divider />
          </div>
        ))}
      </div>
    </div>
  );
};

export default (AnswerList);
