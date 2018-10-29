import * as React from 'react';
import RecipeCard from './RecipeCard';
import { Card } from 'components/generic';
import { RecipeCard as RecipeCardTypes, Recipe } from 'generated/schema';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withProps, compose } from 'recompose';

interface RecipeCardsProps {
  recipes: RecipeCardTypes.Fragment[];
  onRecipeSelected?(recipe: RecipeCardTypes.Fragment): void;
}

const Grid: React.SFC<RecipeCardsProps> = ({ recipes, onRecipeSelected }) => (
  <Card.Grid>
    {recipes.map(recipe => (
      <RecipeCard
        key={recipe.id}
        recipe={recipe}
        onClick={() => onRecipeSelected(recipe)}
      />
    ))}
  </Card.Grid>
);

const withDefaultSelectBehavior = withProps<
  RecipeCardsProps,
  RecipeCardsProps & RouteComponentProps
>(ownProps => ({
  recipes: ownProps.recipes,
  onRecipeSelected:
    ownProps.onRecipeSelected ||
    function(recipe: Recipe) {
      console.log(`nav to ${recipe.id}`);
      ownProps.history.push(`/recipes/${recipe.id}`);
    },
}));

const Skeleton: React.SFC<{ count?: number }> = ({ count = 9 }) => (
  <Card.Grid loading>
    {new Array(count).fill(null).map((_, idx) => (
      <Card.Skeleton key={idx} />
    ))}
  </Card.Grid>
);

interface RecipeCardsWithFragments
  extends React.ComponentClass<RecipeCardsProps> {
  Skeleton?: typeof Skeleton;
  fragments?: {
    [key: string]: any;
  };
}

const RecipeCards: RecipeCardsWithFragments = compose<{}, RecipeCardsProps>(
  withRouter,
  withDefaultSelectBehavior,
)(Grid);

RecipeCards.fragments = RecipeCard.fragments;
RecipeCards.Skeleton = Skeleton;

export default RecipeCards;
