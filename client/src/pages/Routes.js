import { Switch, Route, Redirect } from "react-router-dom";
import NavMenuDesktop from "../components/NavMenuDesktop";
import RightSidePanel from "../components/RightSidePanel";
import QuesListPage from "./QuesListPage";
import AllTagsPage from "./AllTagsPage";
import AllUsersPage from "./AllUsersPage";
import QuestionPage from "./QuestionPage";
import AskQuestionPage from "./AskQuestionPage";
import UserPage from "./UserPage";
import NotFoundPage from "./NotFoundPage";
import { useAuthContext } from "../context/auth";

import { Container, Grid } from "@material-ui/core";
import PendingQuestionsPage from "./PendingQuestionsPage";
import Chats from '../components/Chats';
import DetailedChat from '../components/DetailedChat';

import AddTag from "./AddTag";
import QuesReviewPage from "./QuesReviewPage";
import Analytics from "./Analytics";

const Routes = () => {
  const { user } = useAuthContext();

  return (
    <Container disableGutters>
      <Grid container direction="row" wrap="nowrap" justify="space-between">
        <Switch>
          <Route exact path="/">
            <NavMenuDesktop />
            <QuesListPage />
            <RightSidePanel />
          </Route>
          <Route exact path="/ask">
            {user ? (
              <>
                <NavMenuDesktop />
                <AskQuestionPage />
                <RightSidePanel />
              </>
            ) : (
              <Redirect to="/" />
            )}
          </Route>
          <Route exact path="/tags">
            <NavMenuDesktop />
            <AllTagsPage />
          </Route>
          <Route exact path="/users">
            <NavMenuDesktop />
            <AllUsersPage />
          </Route>
          <Route exact path="/user/:username">
            <NavMenuDesktop />
            <UserPage />
                
          </Route>

          <Route exact path="/user/:username/addtag">
                  <NavMenuDesktop />
                    <UserPage />
                    <div>
                    <AddTag/>
                    </div>
                </Route>

          <Route exact path="/user/:username/review">
            <NavMenuDesktop />
            Question Review Page
              <div>
              <QuesReviewPage/>
              </div>
          </Route>

          <Route exact path="/user/:username/dashboard">
            <NavMenuDesktop />
            Analytics Dashboard Page
              <div>
              <Analytics/>
              </div>
          </Route>
          

          <Route exact path="/questions/:quesId">
            <NavMenuDesktop />
            <QuestionPage />
          </Route>
          {/* <Route exact path="/approve">
            <NavMenuDesktop />
            <PendingQuestionsPage />
          </Route> */}
          <Route exact path="/tags/:tagName">
            <NavMenuDesktop />
            <QuesListPage tagFilterActive={true} />
            <RightSidePanel />
          </Route>
          <Route exact path="/search/:query">
            <NavMenuDesktop/>
            <QuesListPage searchFilterActive={true}/>
            <RightSidePanel/>
          </Route>
          <Route exact path="/messages" >
            <Chats/>
          </Route>
          <Route>
            <NavMenuDesktop />
            <NotFoundPage />
            <RightSidePanel />
          </Route>
        </Switch>
      </Grid>
    </Container>
  );
};

export default Routes;
