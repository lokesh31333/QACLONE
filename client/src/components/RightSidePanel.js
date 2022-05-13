import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { BASE_URL } from "../utils/helperFuncs";
import { Typography, Chip, useMediaQuery, Grid } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { useRightSidePanelStyles } from "../styles/muiStyles";
import { useEffect, useState } from "react";
import localStorage from "../utils/localStorage";
import { useStateContext } from "../context/state";

const RightSidePanel = () => {
  const classes = useRightSidePanelStyles();
  const { notify } = useStateContext();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [tags, setTags] = useState();
  const isNotDesktop = useMediaQuery(theme.breakpoints.down("sm"));

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
        // notify(error.response.data.message, "error");
      }
    }
  };
  useEffect(() => {
    fetchAllTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isNotDesktop) return null;

  return (
    <Grid item>
      <div className={classes.rootPanel}>
        <div className={classes.content}>
          <div className={classes.tagsColumn}>
            <Typography variant="h6" color="secondary">
              Top Tags
            </Typography>
            {!isLoading && tags ? (
              <div className={classes.tagsWrapper}>
                {tags.slice(0, 26).map((t) => (
                  <div key={t.tagName}>
                    <Chip
                      label={
                        t.tagName.length > 13
                          ? t.tagName.slice(0, 13) + "..."
                          : t.tagName
                      }
                      variant="outlined"
                      color="primary"
                      size="small"
                      component={RouterLink}
                      to={`/tags/${t.tagName}`}
                      className={classes.tag}
                      clickable
                    />
                    <Typography
                      color="secondary"
                      variant="caption"
                    >{` × ${t.count}`}</Typography>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ minWidth: "200px" }}>
                <LoadingSpinner size={40} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Grid>
  );
};

export default RightSidePanel;
