import React, { SFC } from 'react';
import Routes from './Routes';
import { Background } from 'components/generic';
import { TokenContext } from 'features/auth';
import { ApolloProvider } from 'react-apollo';
import apolloClient from 'apolloClient';
import { Router } from 'react-router-dom';
import history from 'browserHistory';
import { GlobalStyle, grommetTheme } from 'theme';
import { Grommet, Box } from 'grommet';
import Sidebar from 'features/structure/Sidebar';

const App: SFC<{}> = () => (
  <ApolloProvider client={apolloClient}>
    <Grommet theme={grommetTheme} full>
      <Router history={history}>
        <TokenContext.Provider>
          <Background.Manager>
            <Box direction="row" height="100%" width="100%">
              <Sidebar />
              <Routes />
            </Box>
          </Background.Manager>
        </TokenContext.Provider>
      </Router>
      <GlobalStyle />
    </Grommet>
  </ApolloProvider>
);

export default App;
