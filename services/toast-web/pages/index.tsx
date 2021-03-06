import React from 'react';
import Link from 'components/Link';
import {
  Typography,
  Button,
  Container,
  makeStyles,
  Paper,
  Box,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import Logo from '../components/brand/Logo';
import { PlanDeviceExample } from '../components/graphics/PlanDeviceExample/PlanDeviceExample';
import * as colors from '../themes/colors';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  emphasis: {
    color: theme.palette.primary.dark,
  },
  tagline: {},
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
    '&:not(:first-of-type)': {
      height: '50vh',
      alignSelf: 'flex-start',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      '& > * ': {
        flex: `1 0 0`,
      },
    },
    '&:first-of-type': {
      height: '50vh',
      justifyContent: 'flex-end',
    },
  },
  graphic: {
    margin: 'auto',
  },
  logo: {
    margin: 'auto',
    marginBottom: theme.spacing(3),
  },
  target: {
    height: '300px',
    width: '100%',
    background: theme.palette.grey[200],
    borderRadius: '12px',
  },
}));

const LandingPage = () => {
  const classes = useStyles({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container className={classes.container} maxWidth="md">
      {isMobile && (
        <Logo
          size="20vmin"
          className={classes.logo}
          borderColor={colors.yellow[900]}
        />
      )}
      <Paper className={classes.paper}>
        <Typography className={classes.tagline} variant="h1" gutterBottom>
          Meal planning with{' '}
          <span className={classes.emphasis}>your recipes</span>
        </Typography>

        <PlanDeviceExample className={classes.graphic} />

        <Box display="flex" flexDirection="column" mt={3}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            component={Link}
            {...({ to: '/login?r=/home' } as any)}
          >
            Sign up
          </Button>
          <Typography
            style={{ margin: 'auto', marginTop: 8 }}
            variant="caption"
          >
            30 day free trial - $5 per month
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LandingPage;
