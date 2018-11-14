import React from 'react';
import { BackdropArt } from 'components/brand';
import { H1, P, H2 } from 'components/typeset';
import { Background, Button } from 'components/generic';
import styled from 'styled-components';
import auth from 'services/auth';
import { Content } from 'components/layouts';

export default () => (
  <React.Fragment>
    <Background backgroundKey="planAnonLanding">
      <BackdropArt />
    </Background>
    <Content mode="overlay">
      <H1>Bring order to your week</H1>
      <P>
        Join Toast and start planning your daily meals in advance the easy way.
      </P>
      <P>
        <Button.Positive onClick={() => auth.login()}>
          Join or Log In
        </Button.Positive>
      </P>
      <H2>All of the Internet's Recipes</H2>
      <P>
        Bring all your favorites. We make it easy to scan recipes from across
        the web and add them to your plan.
      </P>
      <H2>Instantly Fit Your Schedule with Toast Gold</H2>
      <P>
        Upgrade your account to make planning even easier with an AI-driven
        schedule.
      </P>
    </Content>
  </React.Fragment>
);
