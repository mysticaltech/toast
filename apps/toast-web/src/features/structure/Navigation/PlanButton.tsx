import React from 'react';
import { Button, Link, Icon } from 'components/generic';
import { IsLoggedIn } from 'features/auth/gates';

const PlanButton = props => {
  return (
    <IsLoggedIn>
      <Link nav to="/plan" tabIndex={-1} {...props}>
        <Button icon={<Icon name="calendar" />} />
      </Link>
    </IsLoggedIn>
  );
};

export default PlanButton;
