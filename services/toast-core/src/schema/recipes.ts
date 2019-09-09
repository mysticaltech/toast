import { gql } from 'apollo-server-core';

export default gql`
  type Recipe {
    id: ID! @aqlKey
    title: String!

    description: String
    attribution: String
    sourceUrl: String
    servings: Int!
    """
    In minutes
    """
    cookTime: Int
    """
    In minutes
    """
    prepTime: Int
    """
    In minutes
    """
    unattendedTime: Int

    coverImageUrl: String
    coverImageAttribution: String

    createdAt: Date!
    updatedAt: Date!
    viewedAt: Date!
    views: Int! @defaultValue(value: 0)

    published: Boolean! @defaultValue(value: false)
    private: Boolean! @defaultValue(value: true)
    locked: Boolean! @defaultValue(value: true)

    steps: [String!]

    ingredientsConnection(
      first: Int = 50
      after: String = "0"
    ): RecipeIngredientConnection!
      @aqlRelayConnection(
        edgeCollection: "IngredientOf"
        edgeDirection: INBOUND
      )

    containedInViewerCollections: [RecipeCollection!]!
      @aqlSubquery(
        query: """
        LET collections = FLATTEN(
          FOR user_group IN OUTBOUND DOCUMENT(Users, $context.userId) MemberOf
            RETURN FLATTEN(FOR group_collection IN OUTBOUND user_group HasRecipeCollection
              RETURN FLATTEN(FOR group_collection_recipe IN INBOUND group_collection CollectedIn
                FILTER group_collection_recipe._key == $parent._key
                RETURN group_collection
              )
            )
        )
        """
        return: "collections"
      )
      @authenticated
  }

  type RecipeIngredientConnection {
    edges: [RecipeIngredientEdge!]! @aqlRelayEdges
    pageInfo: RecipeIngredientPageInfo! @aqlRelayPageInfo
  }

  type RecipeIngredientEdge {
    cursor: String!
    node: Ingredient! @aqlRelayNode
  }

  type RecipeIngredientPageInfo {
    hasNextPage: Boolean!
  }

  type RecipeCollection {
    id: ID! @aqlKey
    name: String!
    default: Boolean!
    createdAt: Date!

    recipesConnection(
      first: Int = 10
      after: String
    ): RecipeCollectionRecipesConnection!
      @aqlRelayConnection(
        edgeCollection: "CollectedIn"
        edgeDirection: INBOUND
        cursorExpression: "$node.createdAt"
      )
  }

  type RecipeCollectionRecipesConnection {
    edges: [RecipeCollectionRecipesEdge!]! @aqlRelayEdges
    pageInfo: RecipeCollectionRecipesPageInfo! @aqlRelayPageInfo
  }

  type RecipeCollectionRecipesEdge {
    cursor: String!
    node: Recipe! @aqlRelayNode
  }

  type RecipeCollectionRecipesPageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type RecipeIngredientsConnection {
    edges: [RecipeIngredientsEdge!]! @aqlRelayEdges
    pageInfo: RecipeIngredientsPageInfo! @aqlRelayPageInfo
  }

  type RecipeIngredientsEdge {
    cursor: String!
    node: Ingredient! @aqlRelayNode
  }

  type RecipeIngredientsPageInfo {
    hasNextPage: Boolean!
  }

  enum RecipeLinkProblem {
    FailedIngredients
    IncompleteIngredients
    FailedImage
  }

  type LinkRecipeResult {
    recipe: Recipe @aqlDocument(collection: "Recipes", key: "$parent.recipeId")
    problems: [RecipeLinkProblem!]!
  }

  input RecipeGetInput {
    id: ID!
  }

  extend type Query {
    recipe(input: RecipeGetInput!): Recipe
      @aqlSubquery(
        query: """
        LET recipe_candidate = DOCUMENT(Recipes, $args.input.id)
        LET $field = recipe_candidate.public && recipe_candidate.published ? recipe_candidate : FIRST(
          LET user = DOCUMENT(Users, $context.userId)
          LET authored_recipe = FIRST(
            FOR candidate_authored_recipe IN OUTBOUND user AuthorOf
              LIMIT 1
              RETURN candidate_authored_recipe
          )
          RETURN authored_recipe ? : FIRST(
            LET group = FIRST(
              FOR user_group IN OUTBOUND user MemberOf
                LIMIT 1
                RETURN user_group
            )
            RETURN FIRST(
              FOR collection IN OUTBOUND group HasRecipeCollection
                RETURN FIRST(
                  FOR candidate_collected_recipe IN INBOUND collection CollectedIn
                    FILTER candidate_collected_recipe._key == $args.input.id
                    LIMIT 1
                    RETURN candidate_collected_recipe
                )
            )
          )
        )
        """
      )
  }

  input CreateRecipeInput {
    fields: CreateRecipeFieldsInput!
  }

  input CreateRecipeFieldsInput {
    title: String!
    description: String
    servings: Int
    cookTime: Int
    prepTime: Int
    unattendedTime: Int
    private: Boolean
  }

  type CreateRecipeResult {
    recipe: Recipe!
      @aqlNewQuery
      @aqlSubquery(query: "", return: "$parent.recipe")
  }

  input LinkRecipeInput {
    url: String!
  }

  input CollectRecipeInput {
    recipeId: ID!
    collectionId: ID!
  }

  input UncollectRecipeInput {
    recipeId: ID!
    collectionId: ID
  }

  input UpdateRecipeInput {
    id: ID!
    fields: UpdateRecipeFieldsInput = {}
  }

  input UpdateRecipeFieldsInput {
    title: String
    description: String
    servings: Int
    cookTime: Int
    prepTime: Int
    unattendedTime: Int
    private: Boolean
    published: Boolean
  }

  type UpdateRecipeResult {
    recipe: Recipe!
      @aqlNewQuery
      @aqlSubquery(query: "", return: "$parent.recipe")
  }

  extend type Mutation {
    createRecipe(input: CreateRecipeInput!): CreateRecipeResult!
      @aqlSubquery(
        query: """
        LET user = DOCUMENT(Users, $context.userId)
        LET recipe = FIRST(
          INSERT {
            title: $args.input.fields.title,
            description: $args.input.fields.description,
            servings: $args.input.fields.servings,
            cookTime: $args.input.fields.cookTime,
            prepTime: $args.input.fields.prepTime,
            unattendedTime: $args.input.fields.unattendedTime,
            private: $args.input.fields.private,
            createdAt: DATE_NOW(),
            updatedAt: DATE_NOW()
          } INTO Recipes
          RETURN NEW
        )
        INSERT { _from: user._id, _to: recipe._id } INTO AuthorOf
        """
        return: "{ recipe: recipe }"
      )
      @subscribed

    linkRecipe(input: LinkRecipeInput!): LinkRecipeResult! @subscribed

    updateRecipe(input: UpdateRecipeInput!): Recipe
      @aqlSubquery(
        query: """
        LET recipe = FIRST(
          FOR authored_recipe IN OUTBOUND user AuthorOf
            FILTER authored_recipe._key == $args.input.id
            LIMIT 1
            RETURN authored_recipe
        )
        UPDATE recipe._key WITH {
          title: NON_NULL($args.input.fields.title, recipe.title),
          description: NON_NULL($args.input.fields.description, recipe.description),
          servings: NON_NULL($args.input.fields.servings, recipe.servings),
          cookTime: NON_NULL($args.input.fields.cookTime, recipe.cookTime),
          prepTime: NON_NULL($args.input.fields.prepTime, recipe.prepTime),
          unattendedTime: NON_NULL($args.input.fields.unattendedTime, recipe.unattendedTime),
          private: NON_NULL($args.input.fields.private, recipe.private),
          published: NON_NULL($args.input.fields.published, recipe.published)
        } IN RECIPES
        """
        return: "{ recipe: NEW }"
      )
      @subscribed

    collectRecipe(input: CollectRecipeInput!): Recipe!
      @aqlSubquery(
        query: """
        LET recipe = DOCUMENT(Recipes, $args.input.recipeId)
        LET collection = DOCUMENT(RecipeCollections, $args.input.collectionId)
        LET hasAccess = FIRST(
          LET user = DOCUMENT(Users, $context.userId)
          FOR group IN OUTBOUND 1..1 user MemberOf
            LIMIT 1
            RETURN FIRST(
              FOR groupCollection IN OUTBOUND 1..1 group HasRecipeCollection
                PRUNE groupCollection._key == collection._key
                LIMIT 1
                RETURN groupCollection
            )
        ) != null
        LET collected = hasAccess ? FIRST(
          INSERT { _from: recipe._id, _to: collection._id } INTO CollectedIn
          RETURN recipe
        ) : null
        """
      )
      @subscribed

    uncollectRecipe(input: UncollectRecipeInput!): Recipe
      @aqlSubquery(
        query: """
        LET recipe = DOCUMENT(Recipes, $args.input.recipeId)
        LET collection = DOCUMENT(RecipeCollections, $args.input.collectionId)
        LET hasAccess = FIRST(
          LET user = DOCUMENT(Users, $context.userId)
          FOR group IN OUTBOUND 1..1 user MemberOf
            LIMIT 1
            RETURN FIRST(
              FOR groupCollection IN OUTBOUND 1..1 group HasRecipeCollection
                PRUNE groupCollection._key == collection._key
                LIMIT 1
                RETURN groupCollection
            )
        ) != null
        LET $field = hasAccess ? FIRST(
          LET edge = FIRST(
            FOR n, e IN INBOUND collection CollectedIn
              PRUNE n._key == recipe._key
              RETURN e
          )
          REMOVE edge FROM CollectedIn
          RETURN recipe
        ) : null
        """
      )
      @subscribed
  }
`;
