import axios from "axios";
import { useHistory } from "react-router-dom";
import { useStateContext } from "../context/state";
import QuesAnsDetails from "./QuesAnsDetails";
import AnswerList from "./AnswerList";
import AnswerForm from "./AnswerForm";
import { BASE_URL } from "../utils/helperFuncs";
import { Divider } from "@material-ui/core";
import { useQuesPageStyles } from "../styles/muiStyles";
import localStorage from "../utils/localStorage";
import { useState } from "react";

const QuesPageContent = ({ question }) => {
  const { setEditValues, notify } = useStateContext();
  const history = useHistory();
  const classes = useQuesPageStyles();
  const [updatedQuestion, setUpdatedQuestion] = useState(question);
  const {
    id: quesId,
    answers,
    acceptedAnswer,
    title,
    body,
    tags,
    author,
  } = updatedQuestion;

  const voteQuestion = async (quesId, voteType) => {
    try {
      const loggedUser = localStorage.loadUser();
      const updatedQuestion = await axios.put(
        `${BASE_URL}/questions/vote`,
        { quesId, voteType },
        {
          headers: {
            authorization: loggedUser.token,
          },
        }
      );
      setUpdatedQuestion(updatedQuestion.data);
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };
  const removeQuestion = async (quesId) => {
    try {
      const loggedUser = localStorage.loadUser();
      await axios.delete(`${BASE_URL}/questions/${quesId}`, {
        headers: {
          authorization: loggedUser.token,
        },
      });
      history.push("/");
      notify("Question deleted!");
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };
  const postQuesComment = async (quesId, body) => {
    try {
      const loggedUser = localStorage.loadUser();
      const comments = await axios.post(
        `${BASE_URL}/question-comments/new`,
        { quesId, body },
        {
          headers: {
            authorization: loggedUser.token,
          },
        }
      );
      setUpdatedQuestion({ ...updatedQuestion, comments: comments.data });
      notify("Comment added to question!");
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };
  const updateQuesComment = async (quesId, body, commentId) => {
    try {
      const loggedUser = localStorage.loadUser();
      const comments = await axios.put(
        `${BASE_URL}/question-comments/update`,
        { quesId, body, commentId },
        {
          headers: {
            authorization: loggedUser.token,
          },
        }
      );
      setUpdatedQuestion({ ...updatedQuestion, comments: comments.data });
      notify("Comment updated!");
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };
  const removeQuesComment = async (quesId, commentId) => {
    try {
      const loggedUser = localStorage.loadUser();
      await axios.delete(`${BASE_URL}/question-comments/`, {
        params: { quesId, commentId },
        headers: {
          authorization: loggedUser.token,
        },
      });
      const getQuestion = await axios.get(`${BASE_URL}/questions/get`, {
        params: { quesId },
        headers: {
          authorization: loggedUser.token,
        },
      });
      setUpdatedQuestion(getQuestion.data);
      notify("Comment removed!");
    } catch (error) {
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const upvoteQues = () => {
    voteQuestion(quesId, "UPVOTE");
  };

  const downvoteQues = () => {
    voteQuestion(quesId, "DOWNVOTE");
  };

  const editQues = () => {
    setEditValues({ quesId, title, body, tags });
    history.push("/ask");
  };

  const deleteQues = () => {
    removeQuestion(quesId);
  };

  const addQuesComment = (commentBody) => {
    postQuesComment(quesId, commentBody);
  };

  const editQuesComment = (editedCommentBody, commentId) => {
    updateQuesComment(quesId, editedCommentBody, commentId);
  };

  const deleteQuesComment = (commentId) => {
    removeQuesComment(quesId, commentId);
  };

  const handleUpdateAnswers = (newAnswers) => {
    console.log(newAnswers, updatedQuestion);
    const question = updatedQuestion;
    question.answers = newAnswers;
    setUpdatedQuestion(question);
  };

  return (
    <div className={classes.content}>
      <QuesAnsDetails
        quesAns={updatedQuestion}
        upvoteQuesAns={upvoteQues}
        downvoteQuesAns={downvoteQues}
        editQuesAns={editQues}
        deleteQuesAns={deleteQues}
        addComment={addQuesComment}
        editComment={editQuesComment}
        deleteComment={deleteQuesComment}
      />
      <Divider />
      <AnswerList
        quesId={quesId}
        answers={updatedQuestion.answers}
        acceptedAnswer={acceptedAnswer}
        quesAuthor={author}
      />
      <AnswerForm
        quesId={quesId}
        tags={tags}
        handleUpdateAnswers={handleUpdateAnswers}
      />
    </div>
  );
};

export default QuesPageContent;
