import * as React from 'react';
import { Query, QueryResult } from 'react-apollo';
import gql from 'graphql-tag';
import { ListRecipeIngredientCorrections } from 'generated/schema';

export const Document = gql`
  query ListRecipeIngredientCorrections($offset: Int!) {
    recipeIngredientCorrections(pagination: { offset: $offset }) {
      id
      status
      recipeIngredientId
      correctedValue {
        unit
        unitStart
        unitEnd
        value
        valueStart
        valueEnd
        ingredientStart
        ingredientEnd
        ingredient {
          id
          name
        }
      }
    }
  }
`;

interface ListRecipeIngredientCorrectionsQueryProps {
  variables?: ListRecipeIngredientCorrections.Variables;
  skip?: boolean;
  children(
    result: QueryResult<
      ListRecipeIngredientCorrections.Query,
      ListRecipeIngredientCorrections.Variables
    >,
  ): React.ReactNode;
}

const ListRecipeIngredientCorrectionsQuery: React.SFC<
  ListRecipeIngredientCorrectionsQueryProps
> = props => (
  <Query<
    ListRecipeIngredientCorrections.Query,
    ListRecipeIngredientCorrections.Variables
  >
    query={Document}
    {...props}
  />
);

export default ListRecipeIngredientCorrectionsQuery;
