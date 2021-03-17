import React, {
  useState,
  useRef,
  useEffect
} from 'react';
import { capitalCase } from 'change-case';
import {
  Badge,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Popover,
  SvgIcon,
  Switch,
  TextField,
  Tooltip,
  Typography,
  makeStyles
} from '@material-ui/core';
import { Settings as SettingsIcon } from 'react-feather';
import useSettings from 'src/hooks/useSettings';
import { THEMES } from 'src/constants';

const useStyles = makeStyles((theme) => ({
  badge: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginTop: 10,
    marginRight: 5
  },
  popover: {
    width: 320,
    padding: theme.spacing(2)
  }
}));

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4)
  // eslint-disable-next-line
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const convertedVapidKey = urlBase64ToUint8Array(process.env.REACT_APP_PUBLIC_VAPID_KEY)

const Settings = () => {
  const classes = useStyles();
  const ref = useRef(null);
  const { settings, saveSettings } = useSettings();
  const [isOpen, setOpen] = useState(false);
  const [values, setValues] = useState({
    direction: settings.direction,
    responsiveFontSizes: settings.responsiveFontSizes,
    theme: settings.theme
  });

  const [stateNotifications, setStateNotifications] = useState(false);

  const handleSubscription = (event) => {
    setStateNotifications(event.target.checked)
    console.log("Switch : ", event.target.checked);

    if (event.target.checked) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function (registration) {
          if (!registration.pushManager) {
            console.log('Push manager unavailable.')
            return
          }

          registration.pushManager.getSubscription().then(function (existedSubscription) {
            if (existedSubscription === null) {
              console.log('No subscription detected, make a request.')
              registration.pushManager.subscribe({
                applicationServerKey: convertedVapidKey,
                userVisibleOnly: true,
              }).then(function (newSubscription) {
                console.log('New subscription added.')

                fetch(`${process.env.REACT_APP_API_URL}/api/notifications/subscribe`, {
                  method: 'POST',
                  body: JSON.stringify(newSubscription),
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + localStorage.getItem('accessToken'),
                  }
                })


                // sendSubscription(newSubscription)
              }).catch(function (e) {
                if (Notification.permission !== 'granted') {
                  setStateNotifications(false)
                  console.log('Permission was not granted.')
                } else {
                  setStateNotifications(false)
                  console.error('An error ocurred during the subscription process.', e)
                }
              })
            } else {
              console.log('Existed subscription detected.')
              // sendSubscription(existedSubscription)
            }
          })
        })
          .catch(function (e) {
            console.error('An error ocurred during Service Worker registration.', e)
          })
      }
    } else {
      navigator.serviceWorker.ready.then(function (reg) {
        reg.pushManager.getSubscription().then(function (subscription) {
          subscription.unsubscribe().then(function (successful) {
            console.log("Successful : ", successful);
            // You've successfully unsubscribed
          }).catch(function (e) {
            console.log("Successful : ", e);

            // Unsubscription failed
          })
        })
      });
    }
  }





  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(function (registration) {
        console.log("serviceWorker");

        if (!registration.pushManager) {
          console.log('Push manager unavailable.')
          return
        }
        registration.pushManager.getSubscription().then(function (existedSubscription) {
          if (existedSubscription === null) {
            console.log('No subscription detected.')
            setStateNotifications(false)

          } else {
            console.log('Existed subscription detected.')
            setStateNotifications(true)

          }
        })
      })
        .catch(function (e) {
          console.error('An error ocurred during Service Worker registration.', e)
          setStateNotifications(false)

        })
    }
  }, [])




  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (field, value) => {
    setValues({
      ...values,
      [field]: value
    });
  };

  const handleSave = () => {
    saveSettings(values);
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Settings">
        <Badge
          color="secondary"
          variant="dot"
          classes={{ badge: classes.badge }}
        >
          <IconButton
            color="inherit"
            onClick={handleOpen}
            ref={ref}
          >
            <SvgIcon fontSize="small">
              <SettingsIcon />
            </SvgIcon>
          </IconButton>
        </Badge>
      </Tooltip>
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        classes={{ paper: classes.popover }}
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
      >
        <Typography
          variant="h4"
          color="textPrimary"
        >
          Settings
        </Typography>
        <Box
          mt={2}
          px={1}
        >
          {/* <FormControlLabel
            control={(
              <Switch
                checked={values.direction === 'rtl'}
                edge="start"
                name="direction"
                onChange={(event) => handleChange('direction', event.target.checked ? 'rtl' : 'ltr')}
              />
            )}
            label="RTL"
          /> */}
          <FormControlLabel
            control={
              <Switch
                checked={stateNotifications}
                onChange={handleSubscription}
                name="checkedB"

                color="primary"
              />
            }
            labelPlacement="end"
            label="Notifications"
          />
        </Box>
        <Box mt={2}>
          <TextField
            fullWidth
            label="Theme"
            name="theme"
            onChange={(event) => handleChange('theme', event.target.value)}
            select
            SelectProps={{ native: true }}
            value={values.theme}
            variant="outlined"
          >
            {Object.keys(THEMES).map((theme) => (
              <option
                key={theme}
                value={theme}
              >
                {capitalCase(theme)}
              </option>
            ))}
          </TextField>
        </Box>
        <Box mt={2}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </Box>
      </Popover>
    </>
  );
}

export default Settings;
