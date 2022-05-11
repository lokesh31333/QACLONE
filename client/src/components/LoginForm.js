import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuthContext } from "../context/auth";
import { useStateContext } from "../context/state";
import ErrorMessage from "./ErrorMessage";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import SofLogo from "../svg/stack-overflow.svg";
import { BASE_URL } from "../utils/helperFuncs";

import {
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
} from "@material-ui/core";
import { useAuthFormStyles } from "../styles/muiStyles";
import PersonIcon from "@material-ui/icons/Person";
import EmailOutlined from "@material-ui/icons/EmailOutlined";
import LockIcon from "@material-ui/icons/Lock";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { of } from "zen-observable";

const validationSchema = yup.object({
  email: yup.string().required("Required"),
  password: yup.string().required("Required"),
});

const LoginForm = ({ setAuthType, closeModal }) => {
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const classes = useAuthFormStyles();
  const { setUser } = useAuthContext();
  const { notify } = useStateContext();
  const { register, handleSubmit, reset, errors } = useForm({
    mode: "onTouched",
    resolver: yupResolver(validationSchema),
  });

  const loginUser = async (password, email) => {
    try {
      setIsLoading(true);
      const loginUsingCredentials = await axios.post(`${BASE_URL}/login`, {
        password,
        email,
      });
      console.log(loginUsingCredentials);
      setIsLoading(false);
      setUser(loginUsingCredentials.data);
      notify(
        `Welcome, ${loginUsingCredentials.data.username}! You're logged in.`
      );
      reset();
      closeModal();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      if (error && error.response) {
        setErrorMsg(error.response.data.message);
      }
    }
  };

  const onLogin = ({ password, email }) => {
    loginUser(password, email);
  };

  return (
    <div className={classes.root}>
      <img src={SofLogo} alt="sof-logo" className={classes.titleLogo} />
      <form onSubmit={handleSubmit(onLogin)}>
        <div className={classes.inputField}>
          <TextField
            fullWidth
            inputRef={register}
            name="email"
            type="email"
            label="Email"
            variant="outlined"
            size="small"
            error={"email" in errors}
            helperText={"email" in errors ? errors.username.message : ""}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className={classes.inputField}>
          <TextField
            required
            fullWidth
            inputRef={register}
            name="password"
            type={showPass ? "text" : "password"}
            label="Password"
            variant="outlined"
            size="small"
            error={"password" in errors}
            helperText={"password" in errors ? errors.password.message : ""}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPass((prevState) => !prevState)}
                    size="small"
                  >
                    {showPass ? (
                      <VisibilityOffIcon color="secondary" />
                    ) : (
                      <VisibilityIcon color="secondary" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          startIcon={<ExitToAppIcon />}
          type="submit"
          disabled={isLoading}
        >
          Log In
        </Button>
      </form>
      <Typography variant="body1" className={classes.footerText}>
        Don’t have an account?{" "}
        <Link onClick={() => setAuthType("signup")} className={classes.link}>
          Sign Up
        </Link>
      </Typography>
      <ErrorMessage
        errorMsg={errorMsg}
        clearErrorMsg={() => setErrorMsg(null)}
      />
    </div>
  );
};

export default LoginForm;
