import { id } from 'tools';
import { ApolloError } from 'apollo-server-express';
const FIELDS = `.id, .name, .description, .attribution`;

export const listIngredients = ({ offset = 0, count = 10 }, ctx) => {
  return ctx.transaction(async tx => {
    const result = await tx.run(
      `
        MATCH (ingredient:Ingredient)
        RETURN ingredient { ${FIELDS} }
        SKIP $offset LIMIT $count
      `,
      { offset, count },
    );

    return result.records.map(rec => rec.get('ingredient'));
  });
};

export const getIngredient = (id, ctx) => {
  return ctx.transaction(async tx => {
    const result = await tx.run(
      `
        MATCH (ingredient:Ingredient { id: $id })
        RETURN ingredient { ${FIELDS} }
      `,
      { id },
    );

    if (result.records.length === 0) {
      return null;
    }

    return result.records[0].get('ingredient');
  });
};

export const createIngredient = (
  { name, description = null, attribution = null },
  ctx,
) => {
  return ctx.transaction(async tx => {
    const result = await tx.run(
      'CREATE (i:Ingredient {name: $name, description: $description, attribution: $attribution, id: $id}) RETURN i {.id, .name, .description}',
      {
        name: name.toLowerCase(),
        description: description || null,
        attribution,
        id: id(name),
      },
    );

    return result.records[0].get('i');
  });
};

export const updateIngredient = (id, input, ctx) => {
  return ctx.transaction(async tx => {
    const result = await tx.run(
      `
        MATCH (ingredient:Ingredient { id: $id })
        SET ingredient += $input
        RETURN ingredient { ${FIELDS} }
      `,
      { id, input: pick(['name', 'description', 'attribution'], input) },
    );

    if (result.records.length === 0) {
      throw new ApolloError("That ingredient doesn't exist", 'NOT_FOUND');
    }

    return result.records[0].get('ingredient');
  });
};

export const deleteIngredient = (id, ctx) => {
  return ctx.transaction(async tx => {
    await tx.run(
      `
        MATCH (ingredient:Ingredient { id: $id })
        DELETE ingredient
      `,
      { id },
    );

    return null;
  });
};
