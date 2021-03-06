import React, { FC, ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardMedia,
  CardActions,
  CardActionArea,
  Button,
  Badge,
  Theme,
} from '@material-ui/core';
import { RecipeSaveButton } from 'components/recipes/RecipeSaveButton';
import { makeStyles } from '@material-ui/styles';
import { CardProps } from '@material-ui/core/Card';
import { useRouter } from 'next/router';
import clsx from 'clsx';

const truncate = (text: string, length = 40) => {
  if (!text) {
    return '';
  }
  const shorter = text.slice(0, length);
  if (shorter.length !== text.length) {
    return shorter.slice(0, length - 3) + '...';
  }
  return shorter;
};

export interface RecipeCardRecipe {
  id: string;
  title: string;
  coverImageUrl: string | null;
  attribution: string | null;
  published?: boolean;
}

const useBadgeStyles = makeStyles<Theme>(theme => ({
  badge: {
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: theme.palette.grey[50],
    padding: theme.spacing(1),
    transform: 'none',
  },
}));

const MaybeBadge = ({ renderBadge, children, ...rest }) => {
  const classes = useBadgeStyles(rest);

  if (renderBadge) {
    return (
      <Badge
        {...rest}
        classes={{
          badge: classes.badge,
        }}
        color="secondary"
        badgeContent={renderBadge()}
      >
        {children}
      </Badge>
    );
  }

  return children;
};

const useStyles = makeStyles<Theme>(theme => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
  },
  actionArea: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  media: {
    flexGrow: 1,
    backgroundColor: theme.palette.grey[100],
    width: '100%',
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  cardHeader: {
    alignSelf: 'flex-start',
  },
}));

const RecipeCard: FC<
  CardProps & {
    onClick?: () => any;
    actions?: { onClick: () => any; content: string }[];
    recipe: RecipeCardRecipe;
    renderBadge?: () => ReactNode;
    variant?: 'full' | 'compact';
    hideSave?: boolean;
    servings?: number;
  }
> = ({
  recipe,
  onClick,
  actions = [],
  renderBadge: providedRenderBadge,
  variant = 'full',
  hideSave,
  servings,
  ...props
}) => {
  const router = useRouter();
  const classes = useStyles(props);

  const defaultOnClick = () =>
    recipe.published === false
      ? router.push('/recipes/[recipeId]/edit', `/recipes/${recipe.id}/edit`)
      : router.push(
          '/recipes/[recipeId]',
          `/recipes/${recipe.id}${servings ? `?servings=${servings}` : ''}`,
        );

  const renderBadge =
    providedRenderBadge || recipe.published === false
      ? () => 'Draft'
      : undefined;

  return (
    <Card {...props} className={clsx(classes.card, props.className)}>
      <MaybeBadge renderBadge={renderBadge} className={classes.actionArea}>
        <CardActionArea
          onClick={onClick || defaultOnClick}
          className={classes.actionArea}
        >
          {variant !== 'compact' && (
            <CardMedia
              className={classes.media}
              image={recipe.coverImageUrl}
              title={recipe.title}
            />
          )}
          <CardHeader
            className={classes.cardHeader}
            title={truncate(recipe.title)}
            subheader={truncate(recipe.attribution)}
          />
        </CardActionArea>
      </MaybeBadge>

      {!hideSave ||
        (!!actions.length && (
          <CardActions>
            {!hideSave && <RecipeSaveButton recipeId={recipe.id} />}
            {actions.map(action => (
              <Button size="small" color="primary" onClick={action.onClick}>
                {action.content}
              </Button>
            ))}
          </CardActions>
        ))}
    </Card>
  );
};

export default RecipeCard;
