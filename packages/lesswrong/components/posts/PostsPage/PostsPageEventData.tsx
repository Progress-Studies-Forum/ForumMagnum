import Button from '@material-ui/core/Button';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import WebIcon from '@material-ui/icons/Web';
import ForumIcon from '@material-ui/icons/Forum';
import CreateIcon from '@material-ui/icons/Create';
import PeopleIcon from '@material-ui/icons/People';
import LaptopIcon from '@material-ui/icons/LaptopMac';
import ViewListIcon from '@material-ui/icons/ViewList';
import LocalActivityIcon from '@material-ui/icons/LocalActivity';
import moment from '../../../lib/moment-timezone';
import React from 'react'
import { useTracking } from '../../../lib/analyticsEvents';
import { registerComponent, Components } from '../../../lib/vulcan-lib';

const styles = (theme: ThemeType): JssStyles => ({
  metadata: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing.unit*2,
    ...theme.typography.postStyle,
    color: 'rgba(0,0,0,0.5)',
    [theme.breakpoints.down('xs')]: {
      display: 'block',
    },
  },
  onlineEventLocation: {
    display: 'block',
    maxWidth: 400,
    color: theme.palette.primary.main,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  eventType: {
    ...theme.typography.commentStyle,
    display: 'flex',
    alignItems: 'center',
    color: '#c0a688',
    fontSize: 12,
    letterSpacing: 0.2,
    marginTop: 12
  },
  eventTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  inPersonEventCTA: {
    marginTop: 20
  },
  onlineEventCTA: {
    flex: 'none',
    margin: '0 24px',
    [theme.breakpoints.down('xs')]: {
      margin: '20px 0 0 12px',
    },
  },
  externalEventPageBtn: {
    textTransform: 'none',
    fontSize: 12
  },
  externalEventPageBtnIcon: {
    fontSize: 15,
    marginLeft: 6
  },
  registerBtnIcon: {
    fontSize: 15,
    marginTop: -2,
    marginLeft: 6
  },
  mapbox: {
    flex: 'none',
    width: 300,
    marginLeft: 10,
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
      marginTop: 20
    },
  },
})

const PostsPageEventData = ({classes, post}: {
  classes: ClassesType,
  post: PostsList,
}) => {
  const {captureEvent} = useTracking()
  
  const { location, contactInfo, onlineEvent, eventRegistrationLink, joinEventLink, eventType } = post
  
  // event location - for online events, attempt to show the meeting link
  let locationNode = location && <div>
    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}>
      {location}
    </a>
  </div>
  if (onlineEvent) {
    locationNode = joinEventLink ? <a
      className={classes.onlineEventLocation}
      href={joinEventLink}
      title={joinEventLink}
      target="_blank" rel="noopener noreferrer">
        {joinEventLink}
    </a> : <div>Online Event</div>
  }
  
  // if this event was labelled with an event type, display it
  const eventTypeIcons = {
    presentation: WebIcon,
    discussion: ForumIcon,
    workshop: CreateIcon,
    social: PeopleIcon,
    coworking: LaptopIcon,
    course: ViewListIcon,
    conference: LocalActivityIcon
  }

  const eventTypeNode = (Icon, text) => <div className={classes.eventType}>
    <Icon className={classes.eventTypeIcon} /> {text.toUpperCase()}
  </div>
  
  // determine if it's currently before, during, or after the event
  const inTenMinutes = moment().add(10, 'minutes')
  const beforeEvent = post.startTime && moment(post.startTime).isAfter(inTenMinutes)
  
  const now = moment()
  const twoHoursAgo = moment().subtract(2, 'hours')
  const afterEvent = (post.endTime && moment(post.endTime).isBefore(now)) ||
    (!post.endTime && post.startTime && moment(post.startTime).isBefore(twoHoursAgo))

  const duringEvent = post.startTime && !beforeEvent && !afterEvent

  // before the event starts, the "Join Event" button is disabled
  let eventCTA = joinEventLink && <Button variant="contained" color="primary" href={joinEventLink} disabled>
    Join Event
  </Button>
  
  // if the event has a registration link, display that instead
  if (beforeEvent && eventRegistrationLink) {
    eventCTA = <Button
      variant="contained" color="primary"
      href={eventRegistrationLink}
      onClick={() => captureEvent("eventRegistrationLinkClick")}
      target="_blank" rel="noopener noreferrer"
    >
      Register <OpenInNewIcon className={classes.registerBtnIcon} />
    </Button>
  }
  // if the event is soon/now, enable the "Join Event" button
  else if (duringEvent) {
    eventCTA = joinEventLink && <Button
      variant="contained" color="primary"
      href={joinEventLink}
      onClick={() => captureEvent("joinEventLinkClick")}
      target="_blank" rel="noopener noreferrer"
    >
      Join Event
    </Button>
  }
  // if the event is over, disable the "Join Event" button and show "Event Ended"
  else if (afterEvent) {
    eventCTA = joinEventLink && <Button variant="contained" color="primary" href={joinEventLink} disabled>
      Event Ended
    </Button>
  }
  
  // if we have no other CTA, then link to the FB or Meetup event page
  if (!eventCTA && post.facebookLink) {
    eventCTA = <Button
      variant={afterEvent ? "outlined" : "contained"} color="primary"
      href={post.facebookLink}
      onClick={() => captureEvent("facebookEventBtnClick")}
      target="_blank" rel="noopener noreferrer"
      className={classes.externalEventPageBtn}
    >
      See event on Facebook <OpenInNewIcon className={classes.externalEventPageBtnIcon} />
    </Button>
  } else if (!eventCTA && post.meetupLink) {
    eventCTA = <Button
      variant={afterEvent ? "outlined" : "contained"} color="primary"
      href={post.meetupLink}
      onClick={() => captureEvent("meetupEventBtnClick")}
      target="_blank" rel="noopener noreferrer"
      className={classes.externalEventPageBtn}
    >
      See event on Meetup <OpenInNewIcon className={classes.externalEventPageBtnIcon} />
    </Button>
  }
  
  return <Components.Typography variant="body2" className={classes.metadata}>
      <div>
        <Components.EventTime post={post} dense={false} />
        { locationNode }
        { contactInfo && <div className={classes.eventContact}> Contact: {contactInfo} </div> }
        { eventType && (eventType in eventTypeIcons) && eventTypeNode(eventTypeIcons[eventType], eventType) }
        {eventCTA && post.startTime && !post.onlineEvent && <div className={classes.inPersonEventCTA}>
          {eventCTA}
        </div>}
      </div>
      {eventCTA && post.startTime && post.onlineEvent && <div className={classes.onlineEventCTA}>
        {eventCTA}
      </div>}
      {!post.onlineEvent && <div className={classes.mapbox}>
        <Components.SmallMapPreview post={post} />
      </div>}
  </Components.Typography>
}

const PostsPageEventDataComponent = registerComponent('PostsPageEventData', PostsPageEventData, {styles});

declare global {
  interface ComponentTypes {
    PostsPageEventData: typeof PostsPageEventDataComponent
  }
}
