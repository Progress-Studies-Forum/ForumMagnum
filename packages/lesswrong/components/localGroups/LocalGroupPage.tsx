import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useSingle } from '../../lib/crud/withSingle';
import React from 'react';
import { Localgroups } from '../../lib/collections/localgroups/collection';
import { Link } from '../../lib/reactRouterWrapper';
import { Posts } from '../../lib/collections/posts';
import { useCurrentUser } from '../common/withUser';
import { createStyles } from '@material-ui/core/styles';
import { postBodyStyles } from '../../themes/stylePiping'
import { sectionFooterLeftStyles } from '../users/UsersProfile'
import qs from 'qs'
import { userIsAdmin } from '../../lib/vulcan-users';
import { forumTypeSetting } from '../../lib/instanceSettings';
import { useMulti } from '../../lib/crud/withMulti';
import Button from '@material-ui/core/Button';
import { FacebookIcon, MeetupIcon, RoundFacebookIcon, SlackIcon } from './GroupLinks';
import EmailIcon from '@material-ui/icons/Email';
import LinkIcon from '@material-ui/icons/Link';

const styles = createStyles((theme: ThemeType): JssStyles => ({
  root: {},
  topSection: {
    [theme.breakpoints.up('md')]: {
      marginTop: -50,
    }
  },
  topSectionMap: {
    height: 250,
    [theme.breakpoints.up('md')]: {
      marginTop: -50,
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: -4,
      marginRight: -4,
    },
  },
  imageContainer: {
    [theme.breakpoints.up('md')]: {
      marginTop: -50,
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: -4,
      marginRight: -4,
    },
  },
  bannerImg: {
    display: 'block',
    maxWidth: '100%',
    objectFit: 'cover',
    margin: '0 auto',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    columnGap: 20,
    marginTop: 24,
    [theme.breakpoints.down('xs')]: {
      display: 'block'
    }
  },
  notifyMe: {
    justifyContent: 'flex-end',
    margin: '8px 4px 20px',
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'flex-start'
    }
  },
  organizerActions: {
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'flex-start !important'
    }
  },
  groupName: {
    ...theme.typography.headerStyle,
    fontSize: "30px",
    marginTop: "0px",
    marginBottom: "0.5rem"
  },
  groupSubtitle: {
    marginBottom: theme.spacing.unit * 2
  },
  groupLocation: {
    ...theme.typography.body2,
    display: "inline-block",
    color: "rgba(0,0,0,0.7)",
  },
  groupDescription: {
    marginBottom: 20,
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0
    }
  },
  groupDescriptionBody: {
    ...postBodyStyles(theme),
    padding: theme.spacing.unit,
  },
  contactUsSection: {
    display: 'flex',
    justifyContent: 'space-between',
    columnGap: '40px',
    marginTop: 40,
    [theme.breakpoints.down('xs')]: {
      display: 'block'
    },
  },
  externalLinkBtns: {
    flex: 'none',
  },
  externalLinkBtnRow: {
    marginBottom: 16
  },
  externalLinkBtn: {
    textTransform: 'none',
    fontSize: 13,
    paddingLeft: 14,
    boxShadow: 'none',
    '& svg': {
      width: 17,
      marginRight: 10
    }
  },
  facebookGroupIcon: {
    fontSize: 13,
  },
  facebookPageIcon: {
    fontSize: 14,
  },
  meetupIcon: {
    fontSize: 15,
  },
  slackIcon: {
    fontSize: 14,
  },
  linkIcon: {
    transform: "rotate(-45deg)",
    fontSize: 17
  },
  emailIcon: {
    fontSize: 17,
  },
  contactUsHeadline: {
    marginBottom: 16,
  },
  eventsHeadline: {
    marginTop: 40,
    marginBottom: 16,
  },
  eventCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 373px)',
    gridGap: '20px',
    '@media (max-width: 812px)': {
      gridTemplateColumns: 'auto',
    }
  },
  loading: {
    marginLeft: 0
  },
  noUpcomingEvents: {
    color: theme.palette.grey[500],
  },
  notifyMeButton: {
    display: 'inline !important',
    color: theme.palette.primary.main,
  },
  pastEventCard: {
    height: 350,
    filter: 'saturate(0.3) opacity(0.8)',
    '& .EventCards-addToCal': {
      display: 'none'
    }
  },
  mapContainer: {
    height: 260,
    maxWidth: 450,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    [theme.breakpoints.down('xs')]: {
      height: 200,
      maxWidth: 'none'
    },
  }
}));

const LocalGroupPage = ({ classes, documentId: groupId }: {
  classes: ClassesType,
  documentId: string,
  groupId?: string,
}) => {
  const currentUser = useCurrentUser();
  const {
    HeadTags, CommunityMapWrapper, SingleColumnSection, SectionTitle, PostsList2,
    Loading, SectionButton, NotifyMeButton, SectionFooter, GroupFormLink, ContentItemBody,
    Error404, CloudinaryImage2, EventCards, LoadMore
  } = Components

  const { document: group, loading: groupLoading } = useSingle({
    collectionName: "Localgroups",
    fragmentName: 'localGroupsHomeFragment',
    documentId: groupId
  })
  
  const {
    results: upcomingEvents,
    loading: upcomingEventsLoading,
    loadMoreProps: upcomingEventsLoadMoreProps
  } = useMulti({
    terms: {view: 'upcomingEvents', groupId: groupId},
    collectionName: "Posts",
    fragmentName: 'PostsList',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: "cache-first",
    limit: 2,
    itemsPerPage: 6,
    enableTotal: true,
  });
  const {
    results: tbdEvents,
    loading: tbdEventsLoading,
    loadMoreProps: tbdEventsLoadMoreProps
  } = useMulti({
    terms: {view: 'tbdEvents', groupId: groupId},
    collectionName: "Posts",
    fragmentName: 'PostsList',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: "cache-first",
    limit: 2,
    itemsPerPage: 6,
    enableTotal: true,
  });
  const {
    results: pastEvents,
    loading: pastEventsLoading,
    loadMoreProps: pastEventsLoadMoreProps
  } = useMulti({
    terms: {view: 'pastEvents', groupId: groupId},
    collectionName: "Posts",
    fragmentName: 'PostsList',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: "cache-first",
    limit: 2,
    itemsPerPage: 6,
    enableTotal: true,
  });

  if (groupLoading) return <Loading />
  if (!group || group.deleted) return <Error404 />

  const { html = ""} = group.contents || {}
  const htmlBody = {__html: html}
  const isAdmin = userIsAdmin(currentUser);
  const isGroupAdmin = currentUser && group.organizerIds.includes(currentUser._id);
  const isEAForum = forumTypeSetting.get() === 'EAForum';
  
  // by default, we try to show the map at the top if the group has a location
  let topSection = group.googleLocation ? <CommunityMapWrapper
    className={classes.topSectionMap}
    terms={{view: "events", groupId: groupId}}
    groupQueryTerms={{view: "single", groupId: groupId}}
    hideLegend={true}
    mapOptions={{zoom: 11, center: group.googleLocation.geometry.location, initialOpenWindows:[groupId]}}
  /> : <div className={classes.topSection}></div>;
  let smallMap;
  // if the group has a banner image, show that at the top instead, and move the map down
  if (group.bannerImageId) {
    topSection = <div className={classes.imageContainer}>
      <CloudinaryImage2 imgProps={{ar: '191:100', w: '765'}} publicId={group.bannerImageId} className={classes.bannerImg} />
    </div>
    smallMap = group.googleLocation && <CommunityMapWrapper
      className={classes.mapContainer}
      terms={{view: "events", groupId: groupId}}
      groupQueryTerms={{view: "single", groupId: groupId}}
      hideLegend={true}
      mapOptions={{zoom: 5, center: group.googleLocation.geometry.location}}
    />
  }
  
  const groupHasContactInfo = group.facebookLink || group.facebookPageLink || group.meetupLink || group.slackLink || group.website || group.contactInfo
  
  // the EA Forum shows the group's events as event cards instead of post list items
  let upcomingEventsList = <PostsList2 terms={{view: 'upcomingEvents', groupId: groupId}} />
  if (isEAForum) {
    upcomingEventsList = !!upcomingEvents?.length ? (
      <div className={classes.eventCards}>
        <EventCards
          events={upcomingEvents}
          loading={upcomingEventsLoading}
          numDefaultCards={2}
          hideSpecialCards
          hideGroupNames
        />
        <LoadMore {...upcomingEventsLoadMoreProps} loadingClassName={classes.loading} />
      </div>
    ) : <Components.Typography variant="body2" className={classes.noUpcomingEvents}>No upcoming events.{' '}
        <NotifyMeButton
          showIcon={false}
          document={group}
          subscribeMessage="Subscribe to be notified when an event is added."
          componentIfSubscribed={<span>We'll notify you when an event is added.</span>}
          className={classes.notifyMeButton}
        />
      </Components.Typography>
  }
  
  let tbdEventsList: JSX.Element|null = <PostsList2 terms={{view: 'tbdEvents', groupId: groupId}} showNoResults={false} />
  if (isEAForum) {
    tbdEventsList = tbdEvents?.length ? <>
      <Components.Typography variant="headline" className={classes.eventsHeadline}>
        Events Yet To Be Scheduled
      </Components.Typography>
      <div className={classes.eventCards}>
        <EventCards
          events={tbdEvents}
          loading={tbdEventsLoading}
          hideSpecialCards
          hideGroupNames
        />
        <LoadMore {...tbdEventsLoadMoreProps}  />
      </div>
    </> : null
  }
  
  let pastEventsList: JSX.Element|null = <>
    <Components.Typography variant="headline" className={classes.eventsHeadline}>
      Past Events
    </Components.Typography>
    <PostsList2 terms={{view: 'pastEvents', groupId: groupId}} />
  </>
  if (isEAForum) {
    pastEventsList = pastEvents?.length ? <>
      <Components.Typography variant="headline" className={classes.eventsHeadline}>
        Past Events
      </Components.Typography>
      <div className={classes.eventCards}>
        <EventCards
          events={pastEvents}
          loading={pastEventsLoading}
          hideSpecialCards
          hideGroupNames
          cardClassName={classes.pastEventCard}
        />
        <LoadMore {...pastEventsLoadMoreProps}  />
      </div>
    </> : null
  }

  return (
    <div className={classes.root}>
      <HeadTags
        title={group.name}
        description={group.contents?.plaintextDescription}
        image={group.bannerImageId && `https://res.cloudinary.com/cea/image/upload/q_auto,f_auto/${group.bannerImageId}.jpg`}
      />
      {topSection}
      <SingleColumnSection>
        <div className={classes.titleRow}>
          <div>
            <SectionTitle title={`${group.inactive ? "[Inactive] " : " "}${group.name}`} noTopMargin />
            <div className={classes.groupSubtitle}>
              <div className={classes.groupLocation}>{group.isOnline ? 'Online Group' : group.location}</div>
            </div>
          </div>
          <div>
            {currentUser && <SectionButton className={classes.notifyMe}>
              <NotifyMeButton
                showIcon
                document={group}
                subscribeMessage="Subscribe to group"
                unsubscribeMessage="Unsubscribe from group"
              />
            </SectionButton>}
            <SectionFooter className={classes.organizerActions}>
              {Posts.options.mutations.new.check(currentUser) &&
                (!isEAForum || isAdmin || isGroupAdmin) && <SectionButton>
                  <Link to={{pathname:"/newPost", search: `?${qs.stringify({eventForm: true, groupId})}`}}>
                    New event
                  </Link>
                </SectionButton>}
              {Localgroups.options.mutations.edit.check(currentUser, group) &&
                (!isEAForum || isAdmin || isGroupAdmin ) &&
                <GroupFormLink documentId={groupId} />
              }
            </SectionFooter>
          </div>
        </div>
        
        <div className={classes.groupDescription}>
          {group.contents && <ContentItemBody
            dangerouslySetInnerHTML={htmlBody}
            className={classes.groupDescriptionBody}
            description={`group ${groupId}`}
          />}
        </div>

        <PostsList2 terms={{view: 'nonEventGroupPosts', groupId: groupId}} showNoResults={false} />
        
        {(groupHasContactInfo || smallMap) && <div className={classes.contactUsSection}>
          {groupHasContactInfo && <div className={classes.externalLinkBtns}>
            <Components.Typography variant="headline" className={classes.contactUsHeadline}>
              Contact Us
            </Components.Typography>
            <div>
              {group.facebookLink && <div className={classes.externalLinkBtnRow}>
                <Button
                  variant="contained" color="primary"
                  href={group.facebookLink}
                  target="_blank" rel="noopener noreferrer"
                  className={classes.externalLinkBtn}
                >
                  <FacebookIcon className={classes.facebookGroupIcon} />
                  See our Facebook group
                </Button>
              </div>}
              {group.facebookPageLink && <div className={classes.externalLinkBtnRow}>
                <Button
                  variant="contained" color="primary"
                  href={group.facebookPageLink}
                  target="_blank" rel="noopener noreferrer"
                  className={classes.externalLinkBtn}
                >
                  <RoundFacebookIcon className={classes.facebookPageIcon} />
                  Learn more on our Facebook page
                </Button>
              </div>}
              {group.meetupLink && <div className={classes.externalLinkBtnRow}>
                <Button
                  variant="contained" color="primary"
                  href={group.meetupLink}
                  target="_blank" rel="noopener noreferrer"
                  className={classes.externalLinkBtn}
                >
                  <MeetupIcon className={classes.meetupIcon} />
                  Find us on Meetup
                </Button>
              </div>}
              {group.slackLink && <div className={classes.externalLinkBtnRow}>
                <Button
                  variant="contained" color="primary"
                  href={group.slackLink}
                  target="_blank" rel="noopener noreferrer"
                  className={classes.externalLinkBtn}
                >
                  <SlackIcon className={classes.slackIcon} />
                  Join us on Slack
                </Button>
              </div>}
              {group.website && <div className={classes.externalLinkBtnRow}>
                <Button
                  variant="outlined" color="primary"
                  href={group.website}
                  target="_blank" rel="noopener noreferrer"
                  className={classes.externalLinkBtn}
                >
                  <LinkIcon className={classes.linkIcon} />
                  Explore our website
                </Button>
              </div>}
              {group.contactInfo && <div className={classes.externalLinkBtnRow}>
                <Button variant="outlined" color="primary" href={`mailto:${group.contactInfo}`} className={classes.externalLinkBtn}>
                  <EmailIcon className={classes.emailIcon} />
                  Email the organizers
                </Button>
              </div>}
            </div>
          </div>}
          {smallMap}
        </div>}

        <Components.Typography variant="headline" className={classes.eventsHeadline}>
          Upcoming Events
        </Components.Typography>
        {upcomingEventsList}

        {tbdEventsList}

        {pastEventsList}
      </SingleColumnSection>
    </div>
  )
}

const LocalGroupPageComponent = registerComponent('LocalGroupPage', LocalGroupPage, {styles});

declare global {
  interface ComponentTypes {
    LocalGroupPage: typeof LocalGroupPageComponent
  }
}
