import React, { FC, useState } from 'react';
import RecipeCollections from './RecipeCollections';
import RecipeCollection from './RecipeCollection';
import { RecipeCollectionRecipe } from 'hooks/features/useCollection';

export interface RecipePickerProps {
  onRecipeSelected(recipe: RecipeCollectionRecipe): void;
}

export const RecipePicker: FC<RecipePickerProps> = ({ onRecipeSelected }) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    null,
  );

  if (!selectedCollectionId) {
    return (
      <RecipeCollections
        onCollectionSelected={coll => setSelectedCollectionId(coll.id)}
      />
    );
  }

  return (
    <RecipeCollection
      collectionId={selectedCollectionId}
      onRecipeSelected={onRecipeSelected}
    />
  );
};

export default RecipePicker;
