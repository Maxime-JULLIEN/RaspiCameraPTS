import React, {
  useCallback,
  useEffect,
  useState
} from 'react';
import {
  Box,
  Container,
  makeStyles
} from '@material-ui/core';
import axios from 'src/utils/axios';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
import Page from 'src/components/Page';
import Header from './Header';
import Results from './Results';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

const OrderListView = () => {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();
  const [orders, setOrders] = useState([]);

  const getOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/cameras", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + localStorage.getItem('accessToken'),
        }
      })

      var { cameras } = await response.json();


      for (let index = 0; index < cameras.length; index++) {
        console.log(cameras[index]);

        const reqConnected = await fetch("/hls/" + cameras[index].id + ".m3u8", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem('accessToken'),
          }
        })
        if (reqConnected.status == 200) cameras[index].connected = 1

      }


      if (isMountedRef.current) {
        setOrders(cameras);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMountedRef]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  return (
    <Page
      className={classes.root}
      title="Orders List"
    >
      <Container maxWidth={false}>
        <Header />
        <Box mt={3}>
          <Results orders={orders} />
        </Box>
      </Container>
    </Page>
  );
};

export default OrderListView;
