import gcloudStorage from 'services/gcloudStorage';
import { RECIPE_FIELDS } from 'schema/recipes/service';
import uuid from 'uuid';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import mime from 'mime-types';
import { UserInputError } from 'apollo-server-express';

export const IMAGE_FIELDS = `.id, .url, .attribution`;

export const getRecipeCoverImage = async (id, ctx) => {
  return ctx.transaction(async tx => {
    const coverImage = await tx.run(
      `
        MATCH (i:Image)<-[:COVER_IMAGE]-(:Recipe {id: $id})
        RETURN i { ${IMAGE_FIELDS} }
      `,
      { id },
    );

    return coverImage.records.length > 0
      ? coverImage.records[0].get('i')
      : null;
  });
};

export const updateRecipeCoverImage = async (id, input, ctx) => {
  let file = await input.file;
  if (!file && input.url) {
    const response = await fetch(input.url);
    const filename = input.url.split('/').pop();
    const fileExt = filename.split('.').pop();
    const buffer = await response.buffer();
    const stream = new Readable();
    stream._read = () => {};
    stream.push(buffer);
    stream.push(null);

    file = {
      stream,
      filename,
      mimetype: mime.lookup(fileExt),
    };
  }

  if (file) {
    const uploaded = await gcloudStorage.upload(file, 'images');
    return ctx.transaction(async tx => {
      const result = await tx.run(
        `
        MATCH (r:Recipe { id: $id })
        MERGE (r)-[:COVER_IMAGE]->(i:Image {id: $imageId, url: $url, attribution: $attribution})
        RETURN r { ${RECIPE_FIELDS} }, i { ${IMAGE_FIELDS} }
        `,
        {
          id,
          imageId: uploaded.id,
          url: uploaded.url,
          attribution: input.attribution,
        },
      );

      const recipe = result.records[0].get('r');
      recipe.coverImage = result.records[0].get('i');
      return recipe;
    });
  } else {
    return ctx.transaction(async tx => {
      const result = await tx.run(
        `
        MATCH (r:Recipe { id: $id })-[:COVER_IMAGE]->(i:Image)
        SET i.attribution = $attribution
        RETURN r { ${RECIPE_FIELDS} }, i { ${IMAGE_FIELDS} }
        `,
        {
          id,
          attribution: input.attribution,
        },
      );

      if (result.records.length === 0) {
        throw new UserInputError('You must upload an image first');
      }

      const recipe = result.records[0].get('r');
      recipe.coverImage = result.records[0].get('i');
      return recipe;
    });
  }
};
