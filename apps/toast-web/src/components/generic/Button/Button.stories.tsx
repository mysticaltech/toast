import * as React from 'react';
import { storiesOf } from '@storybook/react'
import Button from './index';
import { Box } from 'grommet';
import { Icon } from 'components/generic';

storiesOf('Button', module).add('kinds', () => (
  <Box pad="large" align="start">
    <Button label="Plain" />
    <Button primary label="Primary" />
    <Button color="status-error" label="Bad" />
    <Button color="status-ok" label="Good" />
  </Box>
)).add('icon', () => (
  <Box pad="large" align="start">
    <Button label="Icon" icon={<Icon name="beach" />} />
  </Box>
));
