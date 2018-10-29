import * as React from 'react';
import { Mutation, MutationResult, MutationFn } from 'react-apollo';
import gql from 'graphql-tag';
import { CalendarMealSetRecipe } from 'generated/schema';
import fragment from './fragment';

export const Document = gql`
  mutation CalendarMealSetRecipe(
    $weekIndex: Int!
    $dayIndex: Int!
    $mealIndex: Int!
    $actionId: ID!
    $recipeId: ID!
  ) {
    setPlanActionRecipe(
      weekIndex: $weekIndex
      dayIndex: $dayIndex
      mealIndex: $mealIndex
      actionId: $actionId
      recipeId: $recipeId
    ) {
      id
      ...CalendarPlanAction
    }
  }

  ${fragment}
`;

interface CalendarMealSetRecipeMutationProps {
  variables?: CalendarMealSetRecipe.Variables;
  skip?: boolean;
  children(
    mutateFn: MutationFn<
      CalendarMealSetRecipe.Mutation,
      CalendarMealSetRecipe.Variables
    >,
  ): React.ReactNode;
}

const CalendarMealSetRecipeMutation: React.SFC<
  CalendarMealSetRecipeMutationProps
> = props => (
  <Mutation<CalendarMealSetRecipe.Mutation, CalendarMealSetRecipe.Variables>
    mutation={Document}
    {...props}
  />
);

export default CalendarMealSetRecipeMutation;
