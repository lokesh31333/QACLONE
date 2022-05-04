import axios from "axios";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useStateContext } from "../context/state";
import { BASE_URL, formatDateAgo } from "../utils/helperFuncs";

import {
  Typography,
  TextField,
  InputAdornment,
  Avatar,
  Link,
} from "@material-ui/core";
import { useUsersPageStyles } from "../styles/muiStyles";
import SearchIcon from "@material-ui/icons/Search";
import localStorage from "../utils/localStorage";

const AllUsersPage = () => {
  const { notify } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState();

  const [filterInput, setFilterInput] = useState("");
  const classes = useUsersPageStyles();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setIsLoading(true);
        const getUsers = await axios.get(`${BASE_URL}/users/all`);
        const { data } = getUsers;
        setIsLoading(false);
        setUsers(data);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
        if (error && error.response) {
          notify(error.response.data.message, "error");
        }
      }
    };
    fetchAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classes.root}>
      <Typography variant="h5" color="secondary">
        Users
      </Typography>
      <TextField
        className={classes.filterInput}
        value={filterInput}
        placeholder="Filter by username"
        onChange={(e) => setFilterInput(e.target.value)}
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
        }}
      />
      {!isLoading && users ? (
        <div className={classes.usersWrapper}>
          {users
            .filter((u) =>
              u.username.toLowerCase().includes(filterInput.toLowerCase())
            )
            .map((u) => (
              <div key={u.id} className={classes.userBox}>
                <Avatar
                  src={`https://secure.gravatar.com/avatar/${u.id}?s=164&d=identicon`}
                  alt={u.username}
                  className={classes.avatar}
                  component={RouterLink}
                  to={`/user/${u.username}`}
                />
                <div>
                  <Link component={RouterLink} to={`/user/${u.username}`}>
                    <Typography variant="body2">{u.username}</Typography>
                  </Link>
                  <Typography variant="caption">
                    created {formatDateAgo(u.createdAt)} ago
                  </Typography>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div style={{ minWidth: "100%" }}>
          <LoadingSpinner size={80} />
        </div>
      )}
    </div>
  );
};

export default AllUsersPage;
