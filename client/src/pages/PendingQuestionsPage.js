import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import LoadMoreButton from "../components/LoadMoreButton";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { BASE_URL } from "../utils/helperFuncs";
import { Typography, Divider, useMediaQuery } from "@material-ui/core";
import { useQuesListStyles } from "../styles/muiStyles";
import { useTheme } from "@material-ui/core/styles";
import QuestionWithApproveCard from "../components/QuestionWithApproveCard";
import localStorage from "../utils/localStorage";

const PendingQuestionsPage = ({ tagFilterActive, searchFilterActive }) => {
  const { tagName, query } = useParams();

  const [quesData, setQuesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMsg] = useState();
  const [page, setPage] = useState(1);
  const classes = useQuesListStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  const fetchQuestions = async (page, limit) => {
    try {
      setIsLoading(true);
      const loggedUser = localStorage.loadUser();
      if (!loggedUser) {
        throw new Error("Please login to view this page");
      }
      const getQuestions = await axios.get(
        `${BASE_URL}/questions/get-pending-questions`,
        {
          params: {
            page,
            limit,
          },
          headers: {
            authorization: loggedUser.token,
          },
        }
      );
      const { data } = getQuestions;
      console.log(data.questions);
      setIsLoading(false);

      setQuesData(data.questions);
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
  const getQues = (page, limit) => {
    fetchQuestions(page, limit);
  };

  useEffect(() => {
    getQues(1, 12);
    setPage(1);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadPosts = () => {
    getQues(page + 1, 12);
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
          Pending Questions
        </Typography>
      </div>
      <Divider />
      {isLoading && page === 1 && (
        <div style={{ minWidth: "100%", marginTop: "1em" }}>
          <LoadingSpinner size={60} />
        </div>
      )}
      {quesData &&
        (quesData.length !== 0 && !isLoading ? (
          quesData.map((q) => (
            <QuestionWithApproveCard
              key={q.id}
              question={q}
              refetchPendingQuestions={fetchQuestions}
            />
          ))
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

export default PendingQuestionsPage;
