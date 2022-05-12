import { ReactComponent as BookmarkIcon } from '../svg/bookmark.svg';

import { Checkbox, SvgIcon } from '@material-ui/core';
import { useVoteBtnsStyles } from '../styles/muiStyles';

export const BookmarkButton = ({ checked, handlebookmark }) => {
  const classes = useVoteBtnsStyles();

  return (
    <Checkbox
      checked={checked}
      icon={
        <SvgIcon className={classes.icon}>
          <BookmarkIcon />
        </SvgIcon>
      }
      checkedIcon={
        <SvgIcon className={classes.checkedIcon}>
          <BookmarkIcon />
        </SvgIcon>
      }
      onClick={handlebookmark}
    />
  );
};

