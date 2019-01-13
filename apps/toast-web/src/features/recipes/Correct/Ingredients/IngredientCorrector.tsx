import * as React from 'react';
import {
  RecipeIngredient,
  RecipeIngredientCorrectedValueInput,
} from 'generated/schema';
import { Formik } from 'formik';
import { P } from 'components/typeset';
import { Field, Input, Button } from 'components/generic';
import { Picker } from 'features/ingredients';

interface IngredientCorrectorProps {
  recipeIngredient: RecipeIngredient;
  submit(id: string, correction: RecipeIngredientCorrectedValueInput): void;
}

const IngredientCorrector: React.SFC<IngredientCorrectorProps> = ({
  recipeIngredient,
  submit,
}) => {
  const handleSubmit = (values: RecipeIngredient) => {
    submit(recipeIngredient.id, {
      unit: values.unit,
      value: values.value,
      ingredientId: values.ingredient.id,
      unitStart: values.unitStart,
      unitEnd: values.unitEnd,
      valueStart: values.valueStart,
      valueEnd: values.valueEnd,
      ingredientStart: values.ingredientStart,
      ingredientEnd: values.ingredientEnd,
    });
  };

  return (
    <Formik initialValues={recipeIngredient} onSubmit={handleSubmit}>
      {({ values, handleChange, handleSubmit, setFieldValue }) => (
        <form
          onSubmit={handleSubmit}
          style={{ marginBottom: 'var(--spacing-lg)' }}
        >
          <P>{recipeIngredient.text}</P>
          <Field label="Value">
            <Input
              type="number"
              value={`${values.value}`}
              onChange={handleChange}
            />
          </Field>
          <Field label="Unit">
            <Input value={values.unit} onChange={handleChange} />
          </Field>
          <Field label="Ingredient">
            <Picker
              onChange={ing => setFieldValue('ingredient', ing)}
              value={values.ingredient}
              canCreate
            />
          </Field>
          <Button type="submit">Submit correction</Button>
        </form>
      )}
    </Formik>
  );
};

export default IngredientCorrector;
