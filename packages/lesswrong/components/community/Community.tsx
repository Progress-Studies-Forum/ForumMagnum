import { Components, registerComponent, } from '../../lib/vulcan-lib';
import React, { useState, useEffect, useRef } from 'react';
import { useUserLocation } from '../../lib/collections/users/helpers';
import { useCurrentUser } from '../common/withUser';
import { createStyles } from '@material-ui/core/styles';
import * as _ from 'underscore';
import { useDialog } from '../common/withDialog'
import {AnalyticsContext, useTracking} from "../../lib/analyticsEvents";
import { useUpdate } from '../../lib/crud/withUpdate';
import { pickBestReverseGeocodingResult } from '../../server/mapsUtils';
import { useGoogleMaps, geoSuggestStyles } from '../form-components/LocationFormComponent';
import { getBrowserLocalStorage } from '../async/localStorageHandlers';
import Geosuggest from 'react-geosuggest';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { useLocation, useNavigation } from '../../lib/routeUtil';
import Button from '@material-ui/core/Button';
import NotificationsIcon from '@material-ui/icons/Notifications';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import EmailIcon from '@material-ui/icons/MailOutline';
import Search from '@material-ui/icons/Search';
import classNames from 'classnames';
import { userIsAdmin } from '../../lib/vulcan-users';
import { Link } from '../../lib/reactRouterWrapper';

const styles = createStyles((theme: ThemeType): JssStyles => ({
  section: {
    maxWidth: 1200,
    margin: 'auto',
  },
  sectionHeadingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: 800,
    padding: '0 20px',
    margin: '0 auto 40px',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      marginTop: 30,
    },
  },
  sectionHeading: {
    ...theme.typography.headline,
    fontSize: 34,
    margin: 0
  },
  sectionDescription: {
    ...theme.typography.commentStyle,
    textAlign: 'left',
    fontSize: 15,
    lineHeight: '1.8em',
    marginLeft: 60,
    [theme.breakpoints.down('sm')]: {
      marginTop: 20,
      marginLeft: 0
    },
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: 10,
    rowGap: '20px',
    marginTop: 10,
    '@media (max-width: 1200px)': {
      padding: '0 20px',
    },
    [theme.breakpoints.down('sm')]: {
      padding: 0
    },
  },
  keywordSearch: {
    maxWidth: '100%',
  },
  keywordSearchInput: {
    width: 350,
    maxWidth: '100%',
    verticalAlign: 'sub',
    paddingLeft: 10,
    '& input': {
      padding: '15px 14px 15px 0'
    }
  },
  searchIcon: {
    color: theme.palette.primary.main,
    marginRight: 6
  },
  where: {
    display: 'inline-block',
    ...theme.typography.commentStyle,
    fontSize: 13,
    color: "rgba(0,0,0,0.6)",
    paddingLeft: 3
  },
  whereTextDesktop: {
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    }
  },
  whereTextMobile: {
    display: 'none',
    [theme.breakpoints.down('xs')]: {
      display: 'inline'
    }
  },
  geoSuggest: {
    ...geoSuggestStyles(theme),
    display: 'inline-block',
    marginLeft: 6
  },
  notifications: {
    flex: '1 0 0',
    textAlign: 'right',
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  notificationsBtn: {
    textTransform: 'none',
    fontSize: 14,
  },
  notificationsIcon: {
    fontSize: 18,
    marginRight: 6
  },
  tabs: {
    marginBottom: 40,
    '& .MuiTab-labelContainer': {
      fontSize: '1rem'
    }
  },
  localGroupsBtns: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20,
    '@media (max-width: 1200px)': {
      padding: '0 20px',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    },
  },
  localGroupsBtn: {
    textTransform: 'none',
    fontSize: 12
  },
  localGroupsBtnIcon: {
    fontSize: 15,
    marginLeft: 8
  },
  localGroupsBtnEmailIcon: {
    fontSize: 20,
    marginLeft: 10,
    marginRight: 5
  },
  eventsPageLinkRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    ...theme.typography.commentStyle,
    marginTop: 40,
    '@media (max-width: 1200px)': {
      padding: '0 20px',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  eventsPagePrompt: {
    color: theme.palette.grey[600],
    fontSize: 14,
    marginRight: 16
  },
  eventsPageLink: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    fontSize: 13,
    padding: '8px 16px',
    borderRadius: 4,
    marginTop: 10
  },
  addGroup: {
    marginTop: 40
  }
}))


const Community = ({classes}: {
  classes: ClassesType,
}) => {
  const currentUser = useCurrentUser();
  const { openDialog } = useDialog();
  const { history } = useNavigation();
  const { location } = useLocation();
  const { captureEvent } = useTracking();
  
  // local or online
  const [tab, setTab] = useState('local')
  const [distanceUnit, setDistanceUnit] = useState<"km"|"mi">('km')
  const [keywordSearch, setKeywordSearch] = useState('')
  
  useEffect(() => {
    // unfortunately the hash is unavailable on the server, so we check it here instead
    if (location.hash === '#online') {
      setTab('online')
    }
    //No exhaustive deps because this is supposed to run only on mount
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // used to set the user's location if they did not already have one
  const { mutate: updateUser } = useUpdate({
    collectionName: "Users",
    fragmentName: 'UsersProfile',
  });
  
  /**
   * Given a location, update the page query to use that location,
   * then save it to the user's settings (if they are logged in)
   * or to the browser's local storage (if they are logged out).
   *
   * @param {Object} location - The location to save for the user.
   * @param {number} location.lat - The location's latitude.
   * @param {number} location.lng - The location's longitude.
   * @param {Object} location.gmaps - The Google Maps location data.
   * @param {string} location.gmaps.formatted_address - The user-facing address (ex: Cambridge, MA, USA).
   */
  const saveUserLocation = ({lat, lng, gmaps}) => {
    // save it in the page state
    userLocation.setLocationData({lat, lng, loading: false, known: true, label: gmaps.formatted_address})

    if (currentUser) {
      // save it on the user document
      void updateUser({
        selector: {_id: currentUser._id},
        data: {
          location: gmaps.formatted_address,
          googleLocation: gmaps
        }
      })
    } else {
      // save it in local storage
      const ls = getBrowserLocalStorage()
      try {
        ls?.setItem('userlocation', JSON.stringify({lat, lng, known: true, label: gmaps.formatted_address}))
      } catch(e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  }
  
  // if the current user provides their browser location and we don't have a location saved for them,
  // save it accordingly
  const [mapsLoaded, googleMaps] = useGoogleMaps("CommunityHome")
  const [geocodeError, setGeocodeError] = useState(false)
  const saveReverseGeocodedLocation = async ({lat, lng, known}) => {
    if (
      mapsLoaded &&     // we need Google Maps to be loaded before we can call the Geocoder
      !geocodeError &&  // if we've ever gotten a geocoding error, don't try again
      known             // skip if we've received the default location
    ) {
      try {
        // get a list of matching Google locations for the current lat/lng (reverse geocoding)
        const geocoder = new googleMaps.Geocoder();
        const geocodingResponse = await geocoder.geocode({
          location: {lat, lng}
        });
        const results = geocodingResponse?.results;
        
        if (results?.length) {
          const location = pickBestReverseGeocodingResult(results)
          saveUserLocation({lat, lng, gmaps: location})
        } else {
          // update the page state to indicate that we're not waiting on a location name
          userLocation.setLocationData({...userLocation, label: null})
        }
      } catch (e) {
        setGeocodeError(true)
        // eslint-disable-next-line no-console
        console.error(e?.message)
        // update the page state to indicate that we're not waiting on a location name
        userLocation.setLocationData({...userLocation, label: null})
      }
    }
  }

  // on page load, try to get the user's location from:
  // 1. (logged in user) user settings
  // 2. (logged out user) browser's local storage
  // 3. failing those, browser's geolocation API (which we then try to save in #1 or #2)
  const userLocation = useUserLocation(currentUser)
  
  useEffect(() => {
    // if we've gotten a location from the browser's geolocation API, save it
    if (!userLocation.loading && userLocation.known && userLocation.label === '') {
      void saveReverseGeocodedLocation(userLocation)
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation])
  
  const keywordSearchTimer = useRef<any>(null)

  const openEventNotificationsForm = () => {
    openDialog({
      componentName: currentUser ? "EventNotificationsDialog" : "LoginPopup",
    });
  }
  
  const { CommunityBanner, LocalGroups, OnlineGroups, GroupFormLink, DistanceUnitToggle } = Components
  
  const handleChangeTab = (e, value) => {
    setTab(value)
    setKeywordSearch('')
    history.replace({...location, hash: `#${value}`})
  }
  
  const handleKeywordSearch = (e) => {
    const newKeyword = e.target.value
    setKeywordSearch(newKeyword)
    // log the event after typing has stopped for 1 second
    clearTimeout(keywordSearchTimer.current)
    keywordSearchTimer.current = setTimeout(
      () => captureEvent(`keywordSearchGroups`, {tab, keyword: newKeyword}),
      1000
    )
  }
  
  const canCreateGroups = currentUser && userIsAdmin(currentUser)

  return (
    <AnalyticsContext pageContext="Community">
      
      <div className={classes.section}>
        <div className={classes.sectionHeadingRow}>
          <h1 className={classes.sectionHeading}>
            Community
          </h1>
          <div className={classes.sectionDescription}>
            Effective altruism is a global community with thousands of members. Reach out to learn how you can have the most impact.
          </div>
        </div>
      </div>
        
      <CommunityBanner />

      <div className={classes.section}>
        <Tabs value={tab} onChange={handleChangeTab} className={classes.tabs} centered aria-label='view local or online groups'>
          <Tab label="Local Groups" value="local" />
          <Tab label="Online Groups" value="online" />
        </Tabs>
        
        {tab === 'local' && <div key="local">
          <div className={classes.filters}>
            <div className={classes.keywordSearch}>
              <OutlinedInput
                labelWidth={0}
                startAdornment={<Search className={classes.searchIcon}/>}
                placeholder="Search groups"
                onChange={handleKeywordSearch}
                className={classes.keywordSearchInput}
              />
            </div>

            <div>
              <div className={classes.where}>
                <span className={classes.whereTextDesktop}>Groups near</span>
                <span className={classes.whereTextMobile}>Near</span>
                {mapsLoaded
                  && <div className={classes.geoSuggest}>
                      <Geosuggest
                        placeholder="search for a location"
                        onSuggestSelect={(suggestion) => {
                          if (suggestion?.location) {
                            saveUserLocation({
                              ...suggestion.location,
                              gmaps: suggestion.gmaps
                            })
                          }
                        }}
                        initialValue={userLocation?.label}
                      />
                    </div>
                }
              </div>
              {userLocation.known && <DistanceUnitToggle distanceUnit={distanceUnit} onChange={setDistanceUnit} />}
            </div>
              
            <div className={classes.notifications}>
              <Button variant="text" color="primary" onClick={openEventNotificationsForm} className={classes.notificationsBtn}>
                {currentUser?.nearbyEventsNotifications ?
                  <NotificationsIcon className={classes.notificationsIcon} /> :
                  <NotificationsNoneIcon className={classes.notificationsIcon} />
                } Notify me
              </Button>
            </div>
          </div>
          
          <LocalGroups keywordSearch={keywordSearch} userLocation={userLocation} distanceUnit={distanceUnit} />
          
          <div className={classes.localGroupsBtns}>
            <Button href="https://resources.eagroups.org/" variant="outlined" color="primary" target="_blank" rel="noopener noreferrer" className={classes.localGroupsBtn}>
              Start your own group
              <OpenInNewIcon className={classes.localGroupsBtnIcon} />
            </Button>
            <Button href="/contact" color="primary" className={classes.localGroupsBtn}>
              Is your group missing? <EmailIcon className={classes.localGroupsBtnEmailIcon} /> Contact us
            </Button>
          </div>
          
        </div>}
        
        {tab === 'online' && <div key="online">
          <div className={classes.filters}>
            <div className={classes.keywordSearch}>
              <OutlinedInput
                labelWidth={0}
                startAdornment={<Search className={classes.searchIcon}/>}
                placeholder="Search groups"
                onChange={handleKeywordSearch}
                className={classes.keywordSearchInput}
              />
            </div>
          </div>
          <OnlineGroups keywordSearch={keywordSearch} />
        </div>}
        
        <div className={classes.eventsPageLinkRow}>
          <div className={classes.eventsPagePrompt}>Want to see what's happening now?</div>
          <Link to="/events" className={classes.eventsPageLink}>Explore all upcoming events</Link>
        </div>
        
        {canCreateGroups && <div className={classes.addGroup} title="Currently only visible to admins">
          <GroupFormLink isOnline={tab === 'online'} />
        </div>}
      </div>
    </AnalyticsContext>
  )
}

const CommunityComponent = registerComponent('Community', Community, {styles});

declare global {
  interface ComponentTypes {
    Community: typeof CommunityComponent
  }
}
