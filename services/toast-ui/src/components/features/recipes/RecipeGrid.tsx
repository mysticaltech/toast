import React, { FC, ReactElement } from 'react';
import { makeStyles, Theme, Button, Typography } from '@material-ui/core';
import RecipeCard, { RecipeCardRecipe } from '../RecipeCard';
import CardGrid, { CardGridProps } from 'components/generic/CardGrid';
import useRouter from 'use-react-router';

export interface RecipeGridProps extends CardGridProps {
  recipes: RecipeGridRecipe[];
  onRecipeSelected?: (recipe: RecipeGridRecipe) => any;
  fetchMore?: () => any;
  hasNextPage?: boolean;
  emptyState?: ReactElement;
}

type RecipeGridRecipe = RecipeCardRecipe;

const useStyles = makeStyles<Theme, RecipeGridProps>(theme => ({}));

export const RecipeGrid: FC<RecipeGridProps> = props => {
  const classes = useStyles(props);
  const {
    recipes,
    onRecipeSelected,
    fetchMore,
    hasNextPage,
    emptyState,
    ...rest
  } = props;

  const { history } = useRouter();
  const handleRecipeSelected = (recipe: RecipeGridRecipe) => {
    if (onRecipeSelected) {
      onRecipeSelected(recipe);
    } else {
      history.push(`/recipes/${recipe.id}`);
    }
  };

  return (
    <>
      {!!(recipes && recipes.length) ? (
        <>
          <CardGrid {...rest}>
            {recipes.map(recipe => (
              <RecipeCard
                recipe={recipe}
                onClick={() => handleRecipeSelected(recipe)}
              />
            ))}
          </CardGrid>
          {hasNextPage && fetchMore && (
            <Button fullWidth onClick={fetchMore}>
              Load more
            </Button>
          )}
        </>
      ) : (
        emptyState || (
          <Typography variant="caption">
            There are no recipes to show here
          </Typography>
        )
      )}
    </>
  );
};
