import { gql } from 'apollo-server-core';

export default gql`
  type Recipe {
    id: ID!
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
    views: Int!

    published: Boolean!
    private: Boolean!
    locked: Boolean!

    steps: [String!]
    ingredientsConnection: RecipeIngredientConnection!

    containedInViewerCollections: [RecipeCollection!]!
      @aqlSubquery(
        query: """
        LET collections = (
          FOR user_group IN OUTBOUND DOCUMENT(Users, $context.userId) MemberOf
            FOR group_collection IN OUTBOUND user_group HasRecipeCollection
              FOR group_collection_recipe IN INBOUND group_collection CollectedIn
                RETURN group_collection
        )
        """
        return: "collections"
      )
      @authenticated
  }

  type RecipeCollection {
    id: ID!
    name: String!
    default: Boolean!
    createdAt: Date!

    recipesConnection: RecipeCollectionRecipesConnection!
      @aqlRelayConnection(
        edgeCollection: "CollectedIn"
        edgeDirection: INBOUND
        cursorProperty: "createdAt"
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

  type RecipeLinkResult {
    recipe: Recipe
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
        LET $field = recipe_candidate.public && recipe_candidate.published ? recipe_candidate : (
          LET user = DOCUMENT(Users, $context.userId)
          LET authored_recipe = FIRST(
            FOR candidate_authored_recipe IN OUTBOUND user AuthorOf
              LIMIT 1
              RETURN candidate_authored_recipe
          )
          RETURN authored_recipe ?: FIRST(
            LET group = FIRST(
              FOR user_group IN OUTBOUND user MemberOf
                LIMIT 1
                RETURN user_group
            )
            LET collections = (
              FOR group_collection IN OUTBOUND group HasRecipeCollection
                RETURN group_collection
            )
            LET collected_recipe = FIRST(
              FOR collection IN collections
                FOR candidate_collected_recipe IN INBOUND collection CollectedIn
                  FILTER candidate_collected_recipe._key == $args.input.id
            )
          )
        )
        """
      )
  }

  input RecipeCreateInput {
    title: String!
    description: String
    servings: Int
    cookTime: Int
    prepTime: Int
    unattendedTime: Int
    private: Boolean
  }

  input RecipeLinkInput {
    url: String!
  }

  input RecipeCollectInput {
    recipeId: ID!
    collectionId: ID!
  }

  input RecipeUncollectInput {
    recipeId: ID!
    collectionId: ID
  }

  input RecipeUpdateInput {
    id: ID!
    fields: RecipeUpdateFieldsInput = {}
    coverImage: RecipeUpdateCoverImageInput
  }

  input RecipeUpdateFieldsInput {
    title: String
    description: String
    servings: Int
    cookTime: Int
    prepTime: Int
    unattendedTime: Int
    private: Boolean
    published: Boolean
  }

  input RecipeUpdateCoverImageInput {
    file: Upload
    attribution: String
  }

  input RecipeRecordViewInput {
    id: ID!
  }

  extend type Mutation {
    createRecipe(input: RecipeCreateInput!): Recipe!
      @generateId
      @aqlSubquery(
        query: """
        LET user = DOCUMENT(Users, $context.userId)
        LET recipe = (
          INSERT {
            title: $args.input.title,
            description: $args.input.description,
            servings: $args.input.servings,
            cookTime: $args.input.cookTime,
            prepTime: $args.input.prepTime,
            unattendedTime: $args.input.unattendedTime,
            private: $args.input.private,
          } INTO Recipes
          RETURN NEW
        )
        INSERT { _from: user, _to: recipe } INTO AuthorOf
        """
        return: "recipe"
      )
      @authenticated

    linkRecipe(input: RecipeLinkInput!): RecipeLinkResult! @authenticated

    updateRecipe(input: RecipeUpdateInput!): Recipe
      @aqlSubquery(
        query: """
        LET recipe = FIRST(
          FOR authored_recipe IN OUTBOUND user AuthorOf
            FILTER authored_recipe._key == $args.input.id
            LIMIT 1
            RETURN authored_recipe
        )
        UPDATE recipe WITH {
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
        return: "NEW"
      )
      @authenticated

    collectRecipe(input: RecipeCollectInput!): Recipe!
      @cypher(
        match: """
        (recipe:Recipe{id:$args.input.recipeId}),
          (user:User{id:$context.userId})-[:MEMBER_OF]->(group:Group)-[:HAS_COLLECTION]->
          (collection:RecipeCollection{id:$args.input.collectionId})
        """
        merge: "(recipe)-[:COLLECTED_IN]->(collection)"
        return: "recipe"
      )
      @authenticated

    uncollectRecipe(input: RecipeUncollectInput!): Recipe
      @cypher(
        match: "(recipe:Recipe{id:$args.input.recipeId})"
        optionalMatch: """
        (user:User{id:$context.userId})-[:MEMBER_OF]->(:Group)-[:HAS_COLLECTION]->
          (coll:RecipeCollection)<-[rel:COLLECTED_IN]-(recipe)
        WHERE $args.input.collectionId IS NULL OR coll.id = $args.input.collectionId
        """
        delete: "rel"
        return: "recipe"
      )
      @authenticated
  }
`;
