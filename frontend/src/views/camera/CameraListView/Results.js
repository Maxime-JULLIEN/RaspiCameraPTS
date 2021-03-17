import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import moment from 'moment';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  CardHeader,
  Checkbox,
  Divider,
  IconButton,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  makeStyles,
  Link,
} from '@material-ui/core';
import {
  Edit as EditIcon,
  ArrowRight as ArrowRightIcon
} from 'react-feather';
import Label from 'src/components/Label';
import GenericMoreButton from 'src/components/GenericMoreButton';

const getStatusLabel = (status) => {
  const map = {
    1: {
      text: 'Connecté',
      color: 'success'
    },
    0: {
      text: 'Déconnecté',
      color: 'error'
    }
  };

  const { text, color } = map[status];

  return (
    <Label color={color}>
      {text}
    </Label>
  );
};

const applyPagination = (orders, page, limit) => {
  return orders.slice(page * limit, page * limit + limit);
};

const useStyles = makeStyles(() => ({
  root: {}
}));

const Results = ({ className, orders, ...rest }) => {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value));
  };

  const paginatedOrders = applyPagination(orders, page, limit);

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Typography
        color="textSecondary"
        gutterBottom
        variant="body2"
      >
        {orders.length}
        {' '}
        caméras. Page
        {' '}
        {page + 1}
        {' '}
        sur
        {' '}
        {Math.ceil(orders.length / limit)}
      </Typography>
      <Card>
        <CardHeader
          action={<GenericMoreButton />}
          title="Mes caméras"
        />
        <Divider />
        <PerfectScrollbar>
          <Box minWidth={300}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Nom
                  </TableCell>

                  <TableCell>
                    Status
                  </TableCell>
                  {/* <TableCell align="right">
                    Actions
                  </TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order) => {

                  return (
                    <TableRow
                      key={order.id}
                    >
                      <TableCell>
                        <Link
                          color="textPrimary"
                          component={RouterLink}
                          to={"/app/camera/" + order.id}
                          variant="h5"
                        >
                          {order.displayName}
                          <Typography
                            variant="body2"
                            color="textSecondary"
                          >
                            {order.name}
                          </Typography>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {getStatusLabel(order.connected)}
                      </TableCell>
                      {/* <TableCell align="right">
                        <IconButton
                          component={RouterLink}
                          to={"/app/cameras/" + order.id}
                        >
                          <SvgIcon fontSize="small">
                            <ArrowRightIcon />
                          </SvgIcon>
                        </IconButton>
                      </TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </PerfectScrollbar>
        <TablePagination
          component="div"
          count={orders.length}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

    </div >
  );
};

Results.propTypes = {
  className: PropTypes.string,
  orders: PropTypes.array.isRequired
};

Results.defaultProps = {
  orders: []
};

export default Results;
