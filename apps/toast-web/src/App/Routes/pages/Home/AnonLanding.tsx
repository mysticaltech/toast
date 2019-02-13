import React from 'react';
import { H1, P, H2 } from 'components/typeset';
import { Button, Link } from 'components/generic';

export default () => (
  <div>
    <H1>Bring order to your week</H1>
    <P>
      Join Toast and start planning your daily meals in advance the easy way.
    </P>
    <P>
      <Link to="/login?r=/plan/setup">
        <Button primary label="Join or Log In" />
      </Link>
    </P>
    <H2>All of the Internet's Recipes</H2>
    <P>
      Bring all your favorites. We make it easy to scan recipes from across the
      web and add them to your plan.
    </P>
    <H2>Instantly Fit Your Schedule with Toast Gold</H2>
    <P>
      Upgrade your account to make planning even easier with an AI-driven
      schedule.
    </P>
  </div>
);
