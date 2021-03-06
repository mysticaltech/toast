import { Button, makeStyles, Paper, Typography } from '@material-ui/core';
import ErrorMessage from 'components/ErrorMessage';
import { Loader } from 'components/Loader/Loader';
import { Row } from 'components/Row';
import gql from 'graphql-tag';
import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';

export const CreatePlanMutation = gql`
  mutation CreatePlan {
    createGroup {
      group {
        id
      }
    }
  }
`;

const useStyles = makeStyles(theme => ({
  button: {},
  paper: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

export const PlanSetup = ({ onCreated }: { onCreated: () => any }) => {
  const [showJoinInfo, setShowJoinInfo] = useState(false);
  const [mutate, { error, loading }] = useMutation(CreatePlanMutation);
  const classes = useStyles({});

  const create = async () => {
    await mutate();
    onCreated();
  };

  return (
    <React.Fragment>
      <Typography component="h1" variant="h2" gutterBottom>
        Let's get started
      </Typography>
      <Typography variant="body1" gutterBottom>
        Thanks for joining Toast! Let's set you up with your new plan. This
        shouldn't take long.
      </Typography>
      <Typography variant="body1" gutterBottom>
        First off, are you looking to start your own plan, or join someone else?
      </Typography>
      {!showJoinInfo ? (
        loading ? (
          <Loader />
        ) : (
          <Row mt={1}>
            <Button
              color="primary"
              variant="contained"
              onClick={create}
              className={classes.button}
            >
              Create my plan
            </Button>
            <Button
              onClick={() => setShowJoinInfo(true)}
              className={classes.button}
            >
              Join someone else's plan
            </Button>
          </Row>
        )
      ) : (
        <Paper className={classes.paper}>
          <Typography variant="body1" gutterBottom>
            To join someone else's plan, you need to ask them to create a magic
            link for you. Ask them to click the Invite button in their settings
            menu and send the link it generates to you.
          </Typography>
          <Button
            onClick={() => setShowJoinInfo(false)}
            className={classes.button}
          >
            Nevermind, I'll make my own plan
          </Button>
        </Paper>
      )}
      {error && <ErrorMessage error={error} />}
    </React.Fragment>
  );
};
