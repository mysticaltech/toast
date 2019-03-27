import React, { FC, useState } from 'react';
import { Formik } from 'formik';
import { Field, Icon } from 'components/generic';
import { Picker } from 'features/ingredients';
import { Button, TextInput, Paragraph, Box, DropButton } from 'grommet';
import { HelpText } from 'components/text';
import { IngredientCorrectionForm } from './CorrectionForm';

export interface IngredientCorrectorRecipeIngredient {
  id: string;
  text: string;
  unit?: string;
  unitStart?: number;
  unitEnd?: number;
  quantity: number;
  quantityStart?: number;
  quantityEnd?: number;
  ingredient?: {
    id: string;
    name: string;
  };
  ingredientStart?: number;
  ingredientEnd?: number;
}

export interface RecipeIngredientCorrectedValueInput {
  unit?: string;
  unitStart?: number;
  unitEnd?: number;
  quantity?: number;
  quantityStart?: number;
  quantityEnd?: number;
  ingredientId?: string;
  ingredientStart?: number;
  ingredientEnd?: number;
  text?: string;
}

interface IngredientCorrectorProps {
  recipeIngredient: IngredientCorrectorRecipeIngredient;
  submit(id: string, correction: RecipeIngredientCorrectedValueInput): void;
  requestDelete(id: string): void;
}

const IngredientCorrector: FC<IngredientCorrectorProps> = ({
  recipeIngredient,
  submit,
  requestDelete,
}) => {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <Box direction="row" width="100%" margin={{ bottom: 'medium' }}>
        <Box flex="grow" alignContent="stretch">
          <Paragraph margin={{ top: '0', bottom: 'small' }}>
            {recipeIngredient.text}
          </Paragraph>
          <Paragraph margin={{ top: '0', bottom: 'small' }}>
            <HelpText>
              Quantity: {recipeIngredient.quantity}, Unit:{' '}
              {recipeIngredient.unit}, Ingredient:{' '}
              {recipeIngredient.ingredient
                ? recipeIngredient.ingredient.name
                : 'Unknown'}
            </HelpText>
          </Paragraph>
        </Box>
        <Box justify="center">
          <DropButton
            icon={<Icon name="three-dots-symbol" />}
            dropAlign={{ right: 'right', top: 'top' }}
            dropContent={
              <Box pad="medium" round background="white">
                <Button
                  label="Suggest Change"
                  onClick={() => setShowForm(true)}
                  margin={{ bottom: 'small' }}
                />
                <Button
                  color="status-critical"
                  onClick={() => requestDelete(recipeIngredient.id)}
                  label="Suggest Delete"
                />
              </Box>
            }
          />
        </Box>
      </Box>
    );
  }

  const handleSubmit = (values: IngredientCorrectorRecipeIngredient) => {
    submit(recipeIngredient.id, {
      unit: values.unit,
      quantity: values.quantity,
      ingredientId: values.ingredient.id,
      unitStart: values.unitStart,
      unitEnd: values.unitEnd,
      quantityStart: values.quantityStart,
      quantityEnd: values.quantityEnd,
      ingredientStart: values.ingredientStart,
      ingredientEnd: values.ingredientEnd,
      text: values.text,
    });
  };

  return (
    <IngredientCorrectionForm
      initialValue={recipeIngredient}
      onSubmit={handleSubmit}
      onCancel={() => setShowForm(false)}
    />
  );
};

export default IngredientCorrector;
