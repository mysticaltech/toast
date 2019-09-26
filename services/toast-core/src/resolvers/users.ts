import { Context } from 'context';
import { logger, aql } from 'toast-common';
import firebase from 'services/firebase';
import { resolver as arango } from 'graphql-arangodb';

const supplementUserData = async (
  dbUser: any,
): Promise<any & Partial<firebase.auth.UserRecord>> => {
  if (!dbUser) {
    return dbUser;
  }

  const id = dbUser.id;
  if (!id) {
    return dbUser;
  }

  try {
    const firebaseUser = await firebase.auth().getUser(id);
    return {
      ...firebaseUser,
      photoUrl: firebaseUser.photoURL,
      ...dbUser,
    };
  } catch (err) {
    logger.warn(err);
    return dbUser;
  }
};

export default {
  Query: {
    viewer: async (parent, args, ctx: Context, info) => {
      if (!ctx.user) {
        return null;
      }
      const user = await arango(parent, args, ctx, info);
      return supplementUserData(user);
    },
    user: async (parent, args, ctx: Context, info) => {
      const user = await arango(parent, args, ctx, info);
      return supplementUserData(user);
    },
  },
  Mutation: {
    updateViewer: async (parent, args, ctx: Context, info) => {
      let photoUrl: string;
      let coverImageUrl: string;

      if (args.input.photo) {
        const { url } = await ctx.gcloudStorage.upload(
          await args.input.photo,
          'images',
        );
        photoUrl = url;
      }
      if (args.input.coverImageUrl) {
        const { url } = await ctx.gcloudStorage.upload(
          await args.input.coverImageUrl,
          'images',
        );
        coverImageUrl = url;
      }

      const user = await arango.runCustomQuery({
        parent,
        args,
        context: ctx,
        info,
        query: aql`
          LET user = DOCUMENT(Users, ${ctx.user.id})
          UPDATE user._key WITH {
            displayName: NOT_NULL(${args.input.displayName ||
              null}, user.displayName),
            bio: NOT_NULL(${args.input.bio || null}, user.bio),
            photoUrl: NOT_NULL(${photoUrl || null}, user.photoUrl),
            coverImageUrl: NOT_NULL(${coverImageUrl ||
              null}, user.coverImageUrl)
          } IN Users
          RETURN {
            user: OLD
          }
        `,
      });

      return supplementUserData(user);
    },
  },
};
