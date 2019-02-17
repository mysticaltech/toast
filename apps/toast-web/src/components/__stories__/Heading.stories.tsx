import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Heading, Box } from 'grommet';

storiesOf('Heading', module).add('kinds', () => (
  <Box>
    <Heading level="1">Level 1</Heading>
    <Heading level="2">Level 2</Heading>
    <Heading level="3">Level 3</Heading>
    <Heading level="4">Level 4</Heading>
    <Heading level="5">Level 5</Heading>
    <Heading level="6">Level 6</Heading>
  </Box>
));
