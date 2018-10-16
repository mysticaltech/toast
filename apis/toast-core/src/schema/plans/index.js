import { gql } from 'apollo-server-express';
import { id } from 'tools';
import { path, pathOr, assocPath, compose, mergeDeepLeft } from 'ramda';
import { UserInputError } from 'errors';
import getWeekIndex from './getWeekIndex';
import getWeekDay from './getWeekDay';

const emptyPlan = {
  days: new Array(7).fill(null).map(() => ({
    meals: new Array(3).fill(null).map(() => ({
      availability: 'SKIP',
      actions: [],
    })),
  })),
};

export const typeDefs = gql`
  enum PrepAvailability {
    SKIP
    EAT_OUT
    NONE
    SHORT
    MEDIUM
    LONG
  }

  enum PlanActionType {
    EAT_OUT
    COOK
    EAT
    READY_MADE
    SKIP
  }

  enum PlanMealType {
    QUICK
    BIG
    FANCY
    NORMAL
  }

  enum PlanStrategy {
    BASIC
    PREP
    BIG_PREP
  }

  interface PlanAction {
    type: PlanActionType!
  }

  type PlanActionEatOut implements PlanAction {
    type: PlanActionType!
    note: String
  }

  type PlanActionCook implements PlanAction {
    type: PlanActionType!
    servings: Int!
    mealType: PlanMealType!
  }

  type PlanActionEat implements PlanAction {
    type: PlanActionType!
    mealDay: Int!
    mealIndex: Int!
    leftovers: Boolean!
    cookAction: PlanActionCook!
  }

  type PlanActionReadyMade implements PlanAction {
    type: PlanActionType!
    note: String
  }

  type PlanActionSkip implements PlanAction {
    type: PlanActionType!
  }

  type PlanMeal {
    id: ID!
    availability: PrepAvailability!
    actions: [PlanAction!]!
  }

  type PlanDay {
    id: ID!
    date: Date
    meals: [PlanMeal!]!
  }

  type Plan {
    id: ID!
    servingsPerMeal: Int!
    days: [PlanDay!]!
    groceryDay: Int!
    warnings: [String!]!

    """
    Access weekly plans using the week index, which is based
    on the fixed plan chronology system. To calculate a week index
    for any particular day, use the root planWeekIndex query
    """
    week(weekIndex: Int!): Plan

    """
    A date representing the first day (Sunday) of this Plan week,
    if (and only if) this Plan is a weekly plan, and not the root "blueprint" plan
    """
    startDate: Date
  }

  input PlanSetDetailsInput {
    servingsPerMeal: Int
    groceryDay: Int
  }

  input PlanSetMealDetailsInput {
    availability: PrepAvailability
  }

  extend type Mutation {
    setPlanDetails(details: PlanSetDetailsInput!): Plan!
      @hasScope(scope: "update:plan")
    setPlanMealDetails(
      dayIndex: Int!
      mealIndex: Int!
      details: PlanSetMealDetailsInput!
    ): Plan! @hasScope(scope: "update:plan")
    processPlan(strategy: PlanStrategy): Plan!
  }

  extend type Group {
    plan: Plan @authenticated
  }

  extend type Query {
    """
    A shortcut function to determine the week index of any particular day
    within the planning system
    """
    planWeekIndex(year: Int!, month: Int!, date: Int!): Int!
    """
    The start date of the entire plan system. You can reference this
    to determine the chronology of plan weeks in conjunction with
    planWeekIndex and the weekIndex field on Plan itself
    """
    planStartWeekDate: Date!
  }
`;

export const resolvers = {
  Query: {
    planWeekIndex: (_parent, { year, month, date }, ctx) =>
      getWeekIndex({
        year,
        month,
        date,
        startDay: ctx.firestore.plans.START_WEEK_DAY,
      }),

    planStartWeekDate: (_parent, _args, ctx) =>
      ctx.firestore.plans.START_WEEK_DAY,
  },

  Mutation: {
    setPlanDetails: async (_parent, args, ctx) => {
      const group = await ctx.graph.groups.getMine();
      let planId = path(['planId'], group);
      // create plan if it doesn't exist
      if (!planId) {
        planId = id('plan');
        await ctx.graph.groups.mergeMine({ planId });
      }

      const defaultPlan = {
        ...emptyPlan,
        id: planId,
      };
      const plan = (await ctx.firestore.plans.get(planId)) || defaultPlan;
      return ctx.firestore.plans.set(planId, { ...plan, ...args.details });
    },

    setPlanMealDetails: async (
      _parent,
      { dayIndex, mealIndex, details },
      ctx,
    ) => {
      const group = await ctx.graph.groups.getMine();

      if (!group || !group.planId) {
        throw new UserInputError("You haven't created a plan yet");
      }

      const plan = await ctx.firestore.plans.get(group.planId);

      const meal = pathOr({}, ['days', dayIndex, 'meals', mealIndex], plan);
      const updatedPlan = assocPath(
        ['days', dayIndex, 'meals', mealIndex],
        {
          ...meal,
          ...details,
        },
        plan,
      );

      await ctx.firestore.plans.set(group.planId, updatedPlan);
      return updatedPlan;
    },

    processPlan: async (_parent, { strategy }, ctx) => {
      const group = await ctx.graph.groups.getMine();

      if (!group || !group.planId) {
        throw new UserInputError("You haven't created a plan yet");
      }

      const plan = await ctx.firestore.plans.get(group.planId);
      const processed = ctx.planner.run(plan, strategy);
      await ctx.firestore.plans.set(group.planId, processed);
      return processed;
    },
  },

  Group: {
    plan: async (parent, args, ctx) => {
      const { planId } = parent;
      const plan = await ctx.firestore.plans.get(planId);
      ctx.plan = plan;
      return plan;
    },
  },

  Plan: {
    week: async (parent, args, ctx) => {
      if (parent.id.includes('week_')) {
        throw new UserInputError(
          "You can't access the week field on a Plan which represents a week already",
        );
      }
      const week = await ctx.firestore.plans.getWeek(parent.id, args.weekIndex);
      ctx.week = week;
      return week;
    },

    startDate: (parent, _args, ctx) => {
      if (!parent.id.includes('week_')) {
        return null;
      }

      return getWeekDay({
        weekIndex: parent.weekIndex,
        startDay: ctx.firestore.plans.START_WEEK_DAY,
      });
    },
  },

  PlanAction: {
    __resolveType: obj => {
      switch (obj.type) {
        case 'COOK':
          return 'PlanActionCook';
        case 'EAT':
          return 'PlanActionEat';
        case 'EAT_OUT':
          return 'PlanActionEatOut';
        case 'READY_MADE':
          return 'PlanActionReadyMade';
        case 'SKIP':
          return 'PlanActionSkip';
      }
    },
  },

  PlanActionEat: {
    cookAction: async (parent, args, ctx) => {
      let plan = ctx.plan;
      if (!plan) {
        const group = await ctx.graph.groups.getMine();

        if (!group || !group.planId) {
          throw new UserInputError("You haven't created a plan yet");
        }

        plan = await ctx.firestore.plans.get(group.planId);
      }

      return pathOr(
        [],
        ['days', parent.mealDay, 'meals', parent.mealIndex, 'actions'],
        plan,
      ).find(action => action.type === 'COOK');
    },
  },

  PlanDay: {
    date: (parent, args, ctx) => {
      if (parent.id.includes('week_')) {
        // this information can be parsed from the id
        const match = /week_(-?\d+)_day_(\d+)/.exec(parent.id);
        if (match) {
          const [_, week, day] = match;
          const date = getWeekDay({
            weekIndex: week,
            startDay: ctx.firestore.plans.START_WEEK_DAY,
            dayOffset: day,
          });
          return date;
        }
      }
      return null;
    },
  },
};
