import * as React from 'react';
import { cold } from 'react-hot-loader';
import { ShoppingListView } from 'generated/schema';
import { CheckBox } from 'grommet';
import { GlobalLoader } from 'components/generic/Loader';
import { formatIngredient } from 'formatters';
import MarkPurchasedMutation from './MarkPurchasedMutation';
import logger from 'logger';

export interface ShoppingListIngredientProps {
  shoppingListId: string;
  totalValue: number;
  unit?: string;
  ingredient: ShoppingListView.Ingredient;
  purchasedValue: number;
}

const ShoppingListIngredient: React.SFC<ShoppingListIngredientProps> = ({
  totalValue,
  unit,
  ingredient,
  purchasedValue,
}) => {
  const [loading, setLoading] = React.useState(false);

  return (
    <MarkPurchasedMutation
      purchased={purchasedValue >= totalValue}
      variables={{ ingredientId: ingredient.id }}
    >
      {mutate => (
        <React.Fragment>
          <CheckBox
            value="done"
            checked={purchasedValue >= totalValue}
            onChange={async () => {
              setLoading(true);
              try {
                await mutate();
              } catch (err) {
                logger.fatal(err);
              } finally {
                setLoading(false);
              }
            }}
            data-grid-area="checkbox"
          >
            {formatIngredient(totalValue, unit || '', ingredient.name)}{' '}
          </CheckBox>
          {loading && <GlobalLoader />}
        </React.Fragment>
      )}
    </MarkPurchasedMutation>
  );
};

export default cold(ShoppingListIngredient);
