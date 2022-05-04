import axios from "axios";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useStateContext } from "../context/state";
import { BASE_URL } from "../utils/helperFuncs";

import { Typography, Chip, TextField, InputAdornment } from "@material-ui/core";
import { useTagsPageStyles } from "../styles/muiStyles";
import SearchIcon from "@material-ui/icons/Search";
import localStorage from "../utils/localStorage";

const AllTagsPage = () => {
  const { notify } = useStateContext();
  const [isLoading, setIsLoading] = useState(true);
  const [tags, setTags] = useState();

  const [filterInput, setFilterInput] = useState("");
  const classes = useTagsPageStyles();

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        setIsLoading(true);
        const getTags = await axios.get(`${BASE_URL}/tags`);
        const { data } = getTags;
        setIsLoading(false);
        setTags(data);
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
  }, []);

  return (
    <div className={classes.root}>
      <Typography variant="h5" className={classes.titleText} color="secondary">
        Tags
      </Typography>
      <Typography variant="body1">
        A tag is a keyword or label that categorizes your question with other,
        similar questions. Using <br />
        the right tags makes it easier for others to find and answer your
        question.
      </Typography>
      <TextField
        className={classes.filterInput}
        value={filterInput}
        placeholder="Filter by tag name"
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
      {!isLoading && tags ? (
        <div className={classes.tagsWrapper}>
          {tags
            .filter((t) =>
              t.tagName.toLowerCase().includes(filterInput.toLowerCase())
            )
            .map((t) => (
              <div key={t.tagName} className={classes.tagBox}>
                <Chip
                  label={t.tagName}
                  variant="outlined"
                  color="primary"
                  size="small"
                  component={RouterLink}
                  to={`/tags/${t.tagName}`}
                  className={classes.tag}
                  clickable
                />
                <Typography variant="caption" color="secondary">
                  {t.count} questions
                </Typography>
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

export default AllTagsPage;
