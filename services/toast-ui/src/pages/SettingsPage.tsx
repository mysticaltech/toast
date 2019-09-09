import React, { FC, useState } from 'react';
import { GroceryDay } from 'components/features/groceryDay/GroceryDay';
import LogoutButton from 'components/features/LogoutButton';
import {
  Typography,
  Box,
  Container,
  Divider,
  Button,
  Paper,
} from '@material-ui/core';
import { GroupInviteButton } from 'components/features/GroupInviteButton';
import Link from 'components/generic/Link';
import { useSubscriptionInfo } from 'hooks/features/useSubscriptionInfo';
import { PlanSetup } from 'components/features/PlanSetup';
import { SubscribeButton } from 'components/features/SubscribeButton';
import { FormattedDate } from 'components/generic/FormattedDate';
import ErrorMessage from 'components/generic/ErrorMessage';
import { Switch, Route } from 'react-router';

export const SettingsPage: FC = () => (
  <Switch>
    <Route path="/settings" exact component={SettingsMainPage} />
    <Route path="/settings/subscription" exact component={SubscriptionPage} />
  </Switch>
);

export const SettingsMainPage: FC = () => {
  return (
    <Container>
      <Typography variant="h2" gutterBottom>
        Group Settings
      </Typography>
      <Box mb={2} mt={2}>
        <GroceryDay />
      </Box>
      <Divider />
      <Box mb={2} mt={2}>
        <GroupInviteButton />
      </Box>
      <Divider />
      <Box mb={2} mt={2}>
        <Button component={Link} to="/subscription">
          Manage your subscription
        </Button>
      </Box>
      <Divider />
      <Box mb={2} mt={2}>
        <LogoutButton />
      </Box>
    </Container>
  );
};

export const SubscriptionPage: FC = () => {
  const {
    data: { canSubscribe, subscribed, subscriptionExpiresAt },
    refetch,
    loading,
    error,
  } = useSubscriptionInfo();
  const [didCancelCheckout, setDidCancelCheckout] = useState(false);

  if (loading) {
    return null;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!canSubscribe) {
    return (
      <Container>
        <PlanSetup onCreated={refetch} />
      </Container>
    );
  }

  if (!subscribed) {
    return (
      <Container>
        <Typography variant="h2" component="h1" gutterBottom>
          Subscribe
        </Typography>
        <Typography paragraph>
          Start scanning recipes and planning meals for $5 a month. Your first
          30 days are free. Cancel any time.
        </Typography>
        {didCancelCheckout && (
          <Paper>
            <Typography variant="h4" gutterBottom>
              Second thoughts?
            </Typography>
            <Typography paragraph>
              Our free trial lasts 30 days! If you're looking for a solution to
              meal-planning, why not give it a shot?
            </Typography>
            <Typography paragraph>
              Or, if you're trying to join the plan of someone who's already
              subscribed, ask them to send you an invite link!
            </Typography>
          </Paper>
        )}
        <SubscribeButton
          onCheckoutCanceled={() => setDidCancelCheckout(true)}
          onCheckoutComplete={refetch}
          variant="contained"
          color="primary"
        />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h2" component="h1" gutterBottom>
        You're subscribed!
      </Typography>
      <Typography variant="caption" gutterBottom>
        Subscription expires <FormattedDate date={subscriptionExpiresAt} />
      </Typography>
      <Box mt={3} mb={3}>
        <Button component={Link} to="/">
          View your plan
        </Button>
      </Box>
    </Container>
  );
};
