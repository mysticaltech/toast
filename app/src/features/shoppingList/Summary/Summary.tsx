import React, { FC } from 'react';
import { Box, Text, Button } from 'grommet';
import { Link } from 'components/generic';
import getNextDay from 'utils/getNextDay';
import { formatDay } from 'formatters/date';
import { ApolloError } from 'apollo-boost';
import ErrorMessage from 'components/generic/ErrorMessage';
import { BoxSkeleton } from 'components/skeletons/Box';

interface ShoppingListSummaryProps {
  groceryDay: { index: number; name: string };
  loading: boolean;
  error?: ApolloError;
}

export const ShoppingListSummary: FC<ShoppingListSummaryProps> = ({
  groceryDay: { index },
  loading,
  error,
}) => {
  const nextGroceryDay = formatDay(getNextDay(new Date(), index));

  if (loading) {
    return <BoxSkeleton height="80px" />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <Box align="start" margin={{ bottom: 'large' }}>
      <Text margin={{ bottom: 'small' }}>Grocery day: {nextGroceryDay}</Text>
      <Link to="/shoppingList">
        <Button label="Go to shopping list" />
      </Link>
    </Box>
  );
};

export default ShoppingListSummary;
