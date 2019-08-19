import * as React from 'react';
import Login from 'components/features/Login';
import { IsLoggedIn } from 'components/auth/IsLoggedIn';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router-dom';
import { parse } from 'query-string';
import { Logo } from 'components/brand';
import { Container } from '@material-ui/core';

export const LoginPage: React.SFC<RouteComponentProps> = ({ location }) => {
  const returnTo = (parse(location.search).r as string) || '/';
  return (
    <IsLoggedIn
      fallback={
        <Container>
          <Logo
            pattern
            style={{ margin: 'auto auto var(--spacing-lg) auto' }}
            size="20vh"
          />
          <Login returnTo={returnTo} />
        </Container>
      }
    >
      <Redirect to="/" />
    </IsLoggedIn>
  );
};
