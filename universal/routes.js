import React from 'react';
import { Route, IndexRoute } from 'react-router';

import PulseApp from './containers/PulseApp';
import RussianLanding from './containers/RussianLanding';
import EnglishLanding from './containers/EnglishLanding';
import Login from './containers/Login';
import Project from './containers/Project';
import NoMatch from './containers/NoMatch';

export default (
  <Route path='/' component={PulseApp}>
    <IndexRoute components={{ru: RussianLanding}} />
    <Route path='en' components={{en: EnglishLanding}} />
    <Route path='en/*' components={{noMatch: NoMatch}} />
    <Route path='new' components={{login: Login}} />
    <Route path='p/:slug' components={{project: Project}} />
    <Route path="*" components={{noMatch: NoMatch}} />
  </Route>
);
