import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useStateContext } from "../context/state";
import { useAuthContext } from "../context/auth";
import SortQuesBar from "../components/SortQuesBar";
import SortSearchBar from "../components/SortSearchBar";
import QuesCard from "../components/QuesCard";
import AuthFormModal from "../components/AuthFormModal";
import LoadMoreButton from "../components/LoadMoreButton";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { BASE_URL } from "../utils/helperFuncs";
import { Typography, Button, Divider, useMediaQuery } from "@material-ui/core";
import { useQuesListStyles } from "../styles/muiStyles";
import { useTheme } from "@material-ui/core/styles";
import localStorage from "../utils/localStorage";

const QuesListPage = ({ tagFilterActive, searchFilterActive }) => {
  const { tagName, query } = useParams();
  const { clearEdit } = useStateContext();
  const { user } = useAuthContext();
  const [quesData, setQuesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMsg] = useState();
  const [sortBy, setSortBy] = useState("HOT");
  const [page, setPage] = useState(1);
  const classes = useQuesListStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  const fetchQuestions = async (
    sortBy,
    page,
    limit,
    filterByTag,
    filterBySearch
  ) => {
    try {
      setIsLoading(true);
      const getQuestions = await axios.get(`${BASE_URL}/questions`, {
        params: {
          sortBy,
          page,
          limit,
          filterBySearch,
          filterByTag,
        },
      });
      const { data } = getQuestions;
      console.log(data.questions);
      setIsLoading(false);
      if (data && page === 1) {
        setQuesData(data.questions);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      if (error && error.response) {
        setErrorMsg(error.response.data.message);
      }
    }
  };
  const getQues = (sortBy, page, limit, filterByTag, filterBySearch) => {
    fetchQuestions(sortBy, page, limit, filterByTag, filterBySearch);
  };

  useEffect(() => {
    getQues(sortBy, 1, 12, tagName, query);
    setPage(1);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, tagName, query]);

  const handleLoadPosts = () => {
    getQues(sortBy, page + 1, 12, tagName, query);
    setPage(page + 1);
  };

  return (
    <div className={classes.root}>
      <div className={classes.topBar}>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          color="secondary"
          style={{ wordWrap: "anywhere" }}
        >
          {/* todo searc result*/}
          {tagFilterActive && searchFilterActive ? (`Search results for "${query}"
          tagged with  [${tagName}]`) :
            (tagFilterActive
              ? `Questions tagged [${tagName}]`
              : searchFilterActive
                ? `Search results for "${query}"`
                : "All Questions")
          }
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
      {(tagFilterActive
        ? <SortQuesBar isMobile={isMobile} sortBy={sortBy} setSortBy={setSortBy} />
        : searchFilterActive
          ? <SortSearchBar isMobile={isMobile} sortBy={sortBy} setSortBy={setSortBy} />
          : <SortQuesBar isMobile={isMobile} sortBy={sortBy} setSortBy={setSortBy} />)}
      {/* <SortQuesBar isMobile={isMobile} sortBy={sortBy} setSortBy={setSortBy} /> */}
      <Divider />
      {isLoading && page === 1 && (
        <div style={{ minWidth: "100%", marginTop: "1em" }}>
          <LoadingSpinner size={60} />
        </div>
      )}
      {quesData &&
        (quesData.length !== 0 && !isLoading ? (
          quesData.map((q) => <QuesCard key={q.id} question={q} />)
        ) : (
          <Typography
            color="secondary"
            variant="h6"
            className={classes.noQuesText}
          >
            {tagFilterActive
              ? `There are no questions tagged "${tagName}".`
              : searchFilterActive
                ? `No matches found for your search "${query}".`
                : "No questions found."}
          </Typography>
        ))}
      {quesData && quesData.next && (
        <LoadMoreButton
          loading={page !== 1 && isLoading}
          handleLoadPosts={handleLoadPosts}
        />
      )}
      <ErrorMessage
        errorMsg={errorMessage}
        clearErrorMsg={() => setErrorMsg(null)}
      />
    </div>
  );
};

export default QuesListPage;
