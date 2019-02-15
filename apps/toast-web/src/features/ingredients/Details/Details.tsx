import React from 'react';
import { RecipeCards } from 'features/recipes';
import { P, Span } from 'components/typeset';
import { sentence } from 'change-case';
import ManageSection from './ManageSection';
import { Disconnected } from 'components/generic';
import IngredientDetailsQuery from './IngredientDetailsQuery';
import { Heading, Paragraph } from 'grommet';

export default ({ ingredientId }) => (
  <IngredientDetailsQuery variables={{ id: ingredientId }}>
    {({ data, loading, error }) => {
      if (loading) {
        return (
          <React.Fragment>
            <Heading>
              <Span.Skeleton />
            </Heading>
            <P.Skeleton />
          </React.Fragment>
        );
      }

      if (error) {
        return <Disconnected />;
      }

      const {
        name,
        description,
        attribution,
        recipes,
        alternateNames,
      } = data.ingredient;

      return (
        <React.Fragment>
          <Heading>{sentence(name)}</Heading>
          {alternateNames.length > 0 && (
            <Paragraph>
              <i>
                Alternate names:{' '}
                {alternateNames.map(name => sentence(name)).join(', ')}
              </i>
            </Paragraph>
          )}
          <Paragraph>{description || 'No details'}</Paragraph>
          {attribution && (
            <Paragraph>
              <i>{attribution}</i>
            </Paragraph>
          )}
          <ManageSection ingredient={data.ingredient} />
          <Heading level="2">Recipes</Heading>
          <RecipeCards recipes={recipes} />
        </React.Fragment>
      );
    }}
  </IngredientDetailsQuery>
);
