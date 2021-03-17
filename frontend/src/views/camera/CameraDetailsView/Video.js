import React, {
  useState,
  useCallback,
  useEffect
} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  makeStyles
} from '@material-ui/core';
import MaiIcon from '@material-ui/icons/MailOutline';
import axios from 'src/utils/axios';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
import ReactPlayer from 'react-player'
const emailOptions = [
  'Resend last invoice',
  'Send password reset',
  'Send verification'
];

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  playerWrapper: {
    position: 'relative',
    'padding-top': '56.25%' /* Player ratio: 100 / (1280 / 720) */,
    width: '100%',
    height: 0,
  },

  reactPlayer: {
    position: 'absolute',
    top: 0,
    left: 0
  }

}));

const Video = ({ className, ...rest }) => {
  const classes = useStyles();
  // const isMountedRef = useIsMountedRef();
  // const [emailOption, setEmailOption] = useState(emailOptions[0]);
  // const [emails, setEmails] = useState([]);

  // const getMails = useCallback(async () => {
  //   try {
  //     const response = await axios.get('/api/customers/1/emails');

  //     if (isMountedRef.current) {
  //       setEmails(response.data.emails);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, [isMountedRef]);

  // useEffect(() => {
  //   getMails();
  // }, [getMails]);

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <div className={classes.playerWrapper}>
        <ReactPlayer
          className={classes.reactPlayer}
          url='https://rcp.linkable.tech/hls/1.m3u8'
          // url='https://www.youtube.com/watch?v=ysz5S6PUM-U'
          width='100%'
          height='100%'
          playing={true}
          controls={true}
        />
      </div>
    </Card>
  );
};

Video.propTypes = {
  className: PropTypes.string,
};

export default Video;
