import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Breadcrumbs,
  Button,
  Grid,
  Link,
  SvgIcon,
  Typography,
  makeStyles
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Edit as EditIcon } from 'react-feather';

const useStyles = makeStyles(() => ({
  root: {}
}));

const Header = ({ className, customer, ...rest }) => {
  const classes = useStyles();

  return (
    <Grid
      container
      spacing={3}
      justify="space-between"
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Grid item>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            variant="body1"
            color="inherit"
            to="/app"
            component={RouterLink}
          >
            Accueil
          </Link>
          <Link
            variant="body1"
            color="inherit"
            to="/app/camera"
            component={RouterLink}
          >
            Mes caméras
          </Link>
          <Typography
            variant="body1"
            color="textPrimary"
          >
            Affichage
          </Typography>
        </Breadcrumbs>
        <Typography
          variant="h3"
          color="textPrimary"
        >
          {"Ma caméra : " + customer.displayName}
        </Typography>
      </Grid>
      {/* <Grid item>
        <Button
          color="secondary"
          variant="contained"
          component={RouterLink}
          to="/app/management/customers/1/edit"
          startIcon={
            <SvgIcon fontSize="small">
              <EditIcon />
            </SvgIcon>
          }
        >
          Edit
        </Button>
      </Grid> */}
    </Grid>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  customer: PropTypes.object.isRequired
};

export default Header;
