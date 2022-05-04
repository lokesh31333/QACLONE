import { useForm } from "react-hook-form";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import { useAuthContext } from "../context/auth";
import { useStateContext } from "../context/state";
import AuthFormModal from "../components/AuthFormModal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { BASE_URL } from "../utils/helperFuncs";
import { Typography, Button, TextField, Chip, Link } from "@material-ui/core";
import { useQuesPageStyles } from "../styles/muiStyles";
import localStorage from "../utils/localStorage";
import { useState } from "react";

const validationSchema = yup.object({
  answerBody: yup.string().min(30, "Must be at least 30 characters"),
});

const AnswerForm = ({ quesId, tags, handleUpdateAnswers }) => {
  const classes = useQuesPageStyles();
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const { clearEdit, notify } = useStateContext();
  const { register, handleSubmit, reset, errors } = useForm({
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  const addAnswer = async (body) => {
    try {
      setIsLoading(true);
      const loggedUser = localStorage.loadUser();
      const newAnswers = await axios.post(
        `${BASE_URL}/answers/new`,
        { quesId, body },
        {
          headers: {
            authorization: loggedUser?.token,
          },
        }
      );
      setIsLoading(false);
      handleUpdateAnswers(newAnswers.data);
      notify("Answer submitted!");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const postAnswer = ({ answerBody }) => {
    addAnswer(answerBody);
  };

  return (
    <div className={classes.answerForm}>
      {user && (
        <Typography variant="h6" color="secondary">
          Your Answer
        </Typography>
      )}
      {user && (
        <form onSubmit={handleSubmit(postAnswer)}>
          <TextField
            inputRef={register}
            name="answerBody"
            required
            fullWidth
            type="text"
            placeholder="Enter atleast 30 characters"
            variant="outlined"
            size="small"
            error={"answerBody" in errors}
            helperText={"answerBody" in errors ? errors.answerBody.message : ""}
            multiline
            rows={5}
          />
          <div>
            <Button
              color="primary"
              variant="contained"
              style={{ marginTop: "0.8em" }}
              type="submit"
              disabled={isLoading}
            >
              Post Your Answer
            </Button>
          </div>
        </form>
      )}
      <div className={classes.footerText}>
        <span>
          Browse other questions tagged{" "}
          {tags.map((t) => (
            <Chip
              key={t}
              label={t}
              variant="outlined"
              color="primary"
              size="small"
              component={RouterLink}
              to={`/tags/${t}`}
              className={classes.footerTag}
              clickable
            />
          ))}
          or{" "}
          {user ? (
            <Link component={RouterLink} to="/ask" onClick={() => clearEdit()}>
              ask your own question.
            </Link>
          ) : (
            <AuthFormModal buttonType="link" />
          )}
        </span>
      </div>
    </div>
  );
};

export default AnswerForm;
