import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Pages */
import Home from './pages/Home';
import RecipeList from './pages/RecipeList';
import Feed from './pages/Feed';
import PostSelection from './pages/PostSelection';
import CreateRecipe from './pages/CreateRecipe';
import CreateFeed from './pages/CreateFeed';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Login from './pages/Login';       // เพิ่มหน้า Login
import Register from './pages/Register'; // เพิ่มหน้า Register
import RecipeDetail from './pages/RecipeDetail';
import FeedDetail from './pages/FeedDetail';
import EditRecipe from './pages/EditRecipe';
import EditFeed from './pages/EditFeed';

/* Components */
import BottomTabs from './components/BottomTabs';

/* Ionic CSS Imports */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      {/* BottomTabs จะแสดงในทุกหน้า หากต้องการซ่อนในหน้า Login/Register 
          ต้องไปจัดการเงื่อนไขภายในตัวคอมโพเนนต์ BottomTabs เองครับ */}
      <BottomTabs />

      <IonRouterOutlet id="main">
        {/* Auth Routes */}
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/register">
          <Register />
        </Route>

        {/* Main Routes */}
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/recipes">
          <RecipeList />
        </Route>
        <Route exact path="/feed">
          <Feed />
        </Route>
        <Route exact path="/post">
          <PostSelection />
        </Route>
        <Route exact path="/create-recipe">
          <CreateRecipe />
        </Route>
        <Route exact path="/create-feed">
          <CreateFeed />
        </Route>
        <Route exact path="/profile">
          <Profile />
        </Route>
        <Route path="/recipe-detail/:id" component={RecipeDetail} exact={true} />
        <Route path="/feed-detail/:id" component={FeedDetail} exact={true} />
        <Route path="/edit-recipe/:id" component={EditRecipe} exact={true} />
        <Route path="/edit-feed/:id" component={EditFeed} exact={true} />


        {/* Edit Profile Route (วางไว้ก่อน Redirect) */}
        <Route exact path="/edit-profile">
          <EditProfile />
        </Route>

        {/* Default Route: เปลี่ยนจาก /home เป็น /login เพื่อบังคับให้ Login ก่อน */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;