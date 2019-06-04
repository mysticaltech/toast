import { gql } from 'apollo-server-core';

export default gql`
  type PlanDay {
    id: ID!
    date: Date!

    cookingConnection: PlanDayCookingRecipeConnection!
  }

  type PlanDayCookingRecipeConnection @cypherVirtual {
    nodes: [Recipe!]! @cypherNode(relationship: "PLANS_TO_COOK", direction: OUT)
    edges: [PlanDayCookingRecipeEdge!]!
      @cypherRelationship(type: "PLANS_TO_COOK", direction: OUT)
  }

  type PlanDayCookingRecipeEdge {
    servings: Int!
    mealName: String!

    node: Recipe! @cypherNode(relationship: "PLANS_TO_COOK", direction: "OUT")
  }

  input AssignPlanDayCookingInput {
    planDayId: ID!
    mealName: String!
    recipeId: ID!
    servings: Int!
  }

  input UnassignPlanDayCookingInput {
    planDayId: ID!
    mealName: String!
  }

  extend type Mutation {
    assignPlanDayCooking(input: AssignPlanDayCookingInput!): PlanDay!
      @cypher(
        match: """
        (:User{id:$context.userId})-[:MEMBER_OF]->(:Group)-[:HAS_NEXT_PLAN_DAY*]->
          (planDay:PlanDay{id:$args.input.planDayId}),
          (recipe:Recipe{id:$args.input.recipeId})
        """
        merge: "(planDay)-[:PLANS_TO_COOK {servings: $args.input.servings, mealName: $args.input.mealName}]->(recipe)"
        return: "planDay"
      )
      @authenticated

    unassignPlanDayCooking(input: UnassignPlanDayCookingInput!): PlanDay!
      @cypher(
        match: """
        (:User{id:$context.userId})-[:MEMBER_OF]->(:Group)-[:HAS_NEXT_PLAN_DAY*]->
          (planDay:PlanDay{id:$args.input.planDayId})-[cookRel:PLANS_TO_COOK {mealName: $args.input.mealName}]->
          (:Recipe)
        """
        delete: "cookRel"
        return: "planDay"
      )
      @authenticated
  }
`;
