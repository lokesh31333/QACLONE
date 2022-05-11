import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useStateContext } from "../context/state";
import ErrorMessage from "../components/ErrorMessage";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { BASE_URL } from "../utils/helperFuncs";
import {
  Typography,
  TextField,
  Button,
  InputAdornment,
  Chip,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useAskQuesPageStyles } from "../styles/muiStyles";
import localStorage from "../utils/localStorage";
import RichTextEditorComponent from "../components/RichTextEditorComponent";

const validationSchema = yup.object({
  title: yup
    .string()
    .required("Required")
    .min(15, "Must be at least 15 characters"),
});

const AskQuestionPage = () => {
  const classes = useAskQuesPageStyles();
  const history = useHistory();
  const [bodyHtml, setBodyHtml] = useState();
  const [bodyContent, setBodyContent] = useState();
  const { editValues, notify } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(editValues ? editValues.tags : []);
  const [errorMsg, setErrorMsg] = useState(null);
  const { register, handleSubmit, errors } = useForm({
    defaultValues: {
      title: editValues ? editValues.title : "",
      body: editValues ? editValues.body : "",
    },
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  const postQuestion = async ({ title, body }) => {
    if (tags.length === 0) return setErrorMsg("Atleast one tag must be added.");
    if (!bodyContent || bodyContent.length < 30) {
      console.log("errorr");
      return setErrorMsg("Body should be at least 30 characters");
    }
    try {
      setIsLoading(true);
      const loggedUser = localStorage.loadUser();
      const newQuestion = await axios.post(
        `${BASE_URL}/questions/new`,
        { title, body: bodyHtml, tags },
        {
          headers: {
            authorization: loggedUser?.token,
          },
        }
      );
      const { data } = newQuestion;
      setIsLoading(false);
      history.push(`/questions/${data.id}`);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const editQuestion = async ({ title, body }) => {
    console.log(title, body, tags);
    if (tags.length === 0) return setErrorMsg("Atleast one tag must be added.");
    if (!bodyContent || bodyContent.length < 30) {
      console.log("errorr");
      return setErrorMsg("Body should be at least 30 characters");
    }
    try {
      setIsLoading(true);
      const loggedUser = localStorage.loadUser();
      const updatedQuestion = await axios.put(
        `${BASE_URL}/questions/update`,
        { quesId: editValues.quesId, title, body: bodyHtml, tags },
        {
          headers: {
            authorization: loggedUser?.token,
          },
        }
      );
      const { data } = updatedQuestion;
      setIsLoading(false);
      history.push(`/questions/${data.id}`);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      if (error && error.response) {
        notify(error.response.data.message, "error");
      }
    }
  };

  const handleTags = (e) => {
    if (!e || (!e.target.value && e.target.value !== "")) return;
    const value = e.target.value.toLowerCase().trim();
    setTagInput(value);

    const keyCode = e.target.value
      .charAt(e.target.selectionStart - 1)
      .charCodeAt();

    if (keyCode === 32 && value.trim() !== "") {
      if (tags.includes(value))
        return setErrorMsg(
          "Duplicate tag found! You can't add the same tag twice."
        );

      if (!/^[a-zA-Z0-9-]*$/.test(value)) {
        return setErrorMsg("Only alphanumeric characters & dash are allowed.");
      }

      if (tags.length >= 5) {
        setTagInput("");
        return setErrorMsg("Max 5 tags can be added! Not more than that.");
      }

      if (value.length > 15) {
        return setErrorMsg("A single tag can't have more than 15 characters.");
      }

      setTags((prevTags) => [...prevTags, value]);
      setTagInput("");
    }
  };

  const onBodyChange = (value) => {
    setBodyHtml(value.toString());
    setBodyContent(value.replace(/<(.|\n)*?>/g, ""));
  };

  return (
    <div className={classes.root}>
      <Typography variant="h5" color="secondary">
        {editValues ? "Edit Your Question" : "Ask A Question"}
      </Typography>
      <form
        className={classes.quesForm}
        onSubmit={
          editValues ? handleSubmit(editQuestion) : handleSubmit(postQuestion)
        }
      >
        <div className={classes.inputWrapper}>
          <Typography variant="caption" color="secondary">
            Be specific and imagine you’re asking a question to another person
          </Typography>
          <TextField
            required
            fullWidth
            inputRef={register}
            name="title"
            placeholder="Enter atleast 15 characters"
            type="text"
            label="Title"
            variant="outlined"
            size="small"
            error={"title" in errors}
            helperText={"title" in errors ? errors.title.message : ""}
            className={classes.inputField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <div></div>
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className={classes.inputWrapper}>
          <Typography variant="caption" color="secondary">
            Include all the information someone would need to answer your
            question
          </Typography>

          <RichTextEditorComponent
            onBodyChange={onBodyChange}
            content={editValues?.body}
          />
        </div>
        <div className={classes.inputWrapper}>
          <Typography variant="caption" color="secondary">
            Add up to 5 tags to describe what your question is about
          </Typography>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            getOptionLabel={(option) => option}
            value={tags}
            inputValue={tagInput}
            onInputChange={handleTags}
            onChange={(e, value, reason) => {
              setTags(value);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Tags"
                placeholder="Enter space button to add tags"
                onKeyDown={handleTags}
                fullWidth
                className={classes.inputField}
                size="small"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  color="primary"
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </div>
        <Button
          type="submit"
          color="primary"
          variant="contained"
          size="large"
          className={classes.submitBtn}
          disabled={isLoading}
        >
          {editValues ? "Update Your Question" : "Post Your Question"}
        </Button>
        <ErrorMessage
          errorMsg={errorMsg}
          clearErrorMsg={() => setErrorMsg(null)}
        />
      </form>
    </div>
  );
};

export default AskQuestionPage;
