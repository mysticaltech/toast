import React, { useCallback, useState } from 'react';
import gql from 'graphql-tag';
import { IsLoggedIn } from 'components/auth/IsLoggedIn';
import useCollectRecipe from '../../hooks/features/useCollectRecipe';
import { useQuery } from '@apollo/react-hooks';
import { path } from 'ramda';
import RecipeCollections from 'components/recipes/RecipeCollections';
import { Button, Dialog, Theme } from '@material-ui/core';
import { FavoriteBorderTwoTone, FavoriteTwoTone } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

const RecipeSaveButtonQuery = gql`
  query RecipeSaveButton($id: ID!) {
    recipe(input: { id: $id }) {
      id
      containedInViewerCollections {
        id
      }
    }
  }
`;

const useStyles = makeStyles<Theme>(theme => ({
  saveIcon: {
    marginRight: theme.spacing(1),
  },
}));

export const RecipeSaveButton = ({ recipeId, ...props }) => {
  const classes = useStyles(props);

  const { save, unsave } = useCollectRecipe({
    refetchQueries: ['RecipeSaveButton'],
  });
  const { data, loading, error } = useQuery(RecipeSaveButtonQuery, {
    variables: { id: recipeId },
  });
  const [showCollectionModal, setShowCollectionModal] = useState<boolean>(
    false,
  );

  const isSaved = !!path(
    ['recipe', 'containedInViewerCollections', 'length'],
    data,
  );

  const onClick = useCallback(() => {
    if (isSaved) {
      unsave({ recipeId });
    } else {
      setShowCollectionModal(true);
    }
  }, [isSaved, save, unsave, recipeId]);

  const handleCollectionSelected = useCallback(
    async collection => {
      await save({ recipeId, collectionId: collection.id });
      setShowCollectionModal(false);
    },
    [save, recipeId],
  );

  if (loading || error || !data) {
    return (
      <IsLoggedIn>
        <Button disabled>
          <FavoriteBorderTwoTone className={classes.saveIcon} /> Save
        </Button>
      </IsLoggedIn>
    );
  }

  return (
    <IsLoggedIn>
      <Button onClick={onClick}>
        {isSaved ? (
          <FavoriteTwoTone className={classes.saveIcon} />
        ) : (
          <FavoriteBorderTwoTone className={classes.saveIcon} />
        )}{' '}
        {isSaved ? 'Saved' : 'Save'}
      </Button>
      <Dialog
        open={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
      >
        <RecipeCollections onCollectionSelected={handleCollectionSelected} />
      </Dialog>
    </IsLoggedIn>
  );
};
