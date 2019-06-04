import React, { FC, useState } from 'react';
import { IngredientCorrectedFieldsInput } from 'features/recipes/Correct/types';
import { Button } from 'grommet';
import { IngredientCorrectionForm } from './CorrectionForm';

export interface AddIngredientProps {
  submitAdd(added: IngredientCorrectedFieldsInput): void;
}

export const AddIngredient: FC<AddIngredientProps> = ({ submitAdd }) => {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <Button
        color="status-ok"
        label="Suggest Missing Ingredient"
        onClick={() => setShowForm(true)}
      />
    );
  }

  return (
    <IngredientCorrectionForm
      onCancel={() => setShowForm(false)}
      initialValue={{ text: '', quantity: 1 }}
      onSubmit={submitAdd}
    />
  );
};
