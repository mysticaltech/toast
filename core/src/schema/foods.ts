import { gql } from 'apollo-server-core';

export default gql`
  type Food {
    id: ID!
    name: String!
    description: String
    attribution: String
    alternateNames: [String!]!
  }

  type FoodDeleteResult {
    # empty type...
    foo: Boolean
  }

  input FoodCreateInput {
    name: String!
    description: String
    attribution: String
    alternateNames: [String!] = []
  }

  input FoodUpdateInput {
    id: ID!
    fields: FoodUpdateFieldsInput!
  }

  input FoodUpdateFieldsInput {
    name: String
    description: String
    attribution: String
    alternateNames: [String!]
  }

  input FoodMergeInput {
    primaryId: ID!
    secondaryId: ID!
  }

  input FoodDeleteInput {
    id: ID!
  }

  extend type Mutation {
    createFood(input: FoodCreateInput!): Food!
      @cypher(
        create: "(ingredient:Food{id:$args.id})"
        set: "ingredient.name = $args.input, ingredient.searchHelpers = $args.input.alternateNames"
        return: "ingredient"
      )
      @generateSlug(fromArg: "input.name")
      @hasClaim(claim: "admin")

    updateFood(input: FoodUpdateInput!): Food
      @cypher(
        match: "(ingredient:Food{id:$args.input.id})"
        set: "ingredient += $args.input.fields"
        return: "ingredient"
      )
      @hasClaim(claim: "admin")

    deleteFood(input: FoodDeleteInput!): FoodDeleteResult
      @cypher(
        match: "(ingredient:Food{id:$args.input.id})"
        detachDelete: "ingredient"
        return: "{}"
      )

    mergeFoods(input: FoodMergeInput!): Food
      @cypherCustom(
        statement: """
        MATCH (secondary:Food{id:$args.input.secondaryId}),
          (primary:Food {id:$args.input.primaryId})
        WITH head(collect([primary, secondary])) as nodes, coalesce(primary.alternateNames, []) +
          coalesce(secondary.alternateNames, []) + secondary.name as newAlternateNames,
          coalesece(primary.searchHelpers, []) + coalesce(secondary.searchHelpers, []) as newSearchHelpers
        CALL apoc.refactor.mergeNodes(nodes, {properties: "discard"}) YIELD node
        SET node.alternateNames = newAlternateNames, node.searchHelpers = newSearchHelpers
        RETURN node
        """
      )
  }
`;
