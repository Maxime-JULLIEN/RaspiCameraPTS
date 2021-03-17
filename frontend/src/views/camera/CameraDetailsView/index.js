import React, {
  useCallback,
  useState,
  useEffect
} from 'react';
import {
  Box,
  Container,
  Divider,
  Tab,
  Tabs,
  makeStyles,
  Grid,

} from '@material-ui/core';
import Page from 'src/components/Page';
import axios from 'src/utils/axios';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
import Header from './Header';
// import Details from './Details';
import { useParams } from "react-router-dom";
import Video from './Video';


const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

const CustomerDetailsView = () => {
  const classes = useStyles();
  let { camera } = useParams();

  const isMountedRef = useIsMountedRef();
  const [customer, setCustomer] = useState(null);

  const getCustomer = useCallback(async () => {
    try {
      const response = await fetch("/api/cameras/" + camera, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + localStorage.getItem('accessToken'),
        }
      })

      const data = await response.json();

      if (isMountedRef.current) {
        setCustomer(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMountedRef]);

  useEffect(() => {
    getCustomer();
  }, [getCustomer]);

  if (!customer) {
    return null;
  }

  return (
    <Page
      className={classes.root}
      title="Customer Details"
    >
      <Container maxWidth={false}>
        <Header customer={customer} />
        <Box mt={3}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              lg={12}
              xs={12}
            >
              <Video />
            </Grid>
          </Grid>
          {/* <Details camera={camera} /> */}
        </Box>
      </Container>
    </Page>
  );
};

export default CustomerDetailsView;
