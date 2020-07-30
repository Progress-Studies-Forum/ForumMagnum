import React from 'react';
import { registerComponent, Components } from '../../lib/vulcan-lib';
import { Posts } from '../../lib/collections/posts';
import { useMulti } from '../../lib/crud/withMulti';
import withErrorBoundary from '../common/withErrorBoundary';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Link } from '../../lib/reactRouterWrapper';

const styles = theme => ({
  root: {
    background: "white",
    padding: 10,
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: "1.3rem",
    boxShadow: theme.boxShadow,
    ...theme.typography.postStyle
  },
  inner: {
    width: "100%",
  },
  tooltip: {
    display: "block"
  },
  link: {
    color: theme.palette.primary.main
  },
  text: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
  }
});

const TagProgressBar = ({classes}: {
  classes: ClassesType,
}) => {

  const { LWTooltip, PostsItem2MetaInfo } = Components;

  const { totalCount: taggedTotal } = useMulti({
    terms: {
      view: "tagProgressTagged",
      limit: 0
    },
    collection: Posts,
    fragmentName: 'PostTagRelevance',
    enableTotal: true,
    fetchPolicy: 'cache-and-network',
    ssr: true
  });

  const { totalCount: postsTotal } = useMulti({
    terms: {
      view: "tagProgressPosts",
      limit: 0
    },
    collection: Posts,
    fragmentName: 'PostTagRelevance',
    enableTotal: true,
    fetchPolicy: 'cache-and-network',
    ssr: true
  });

  if (!taggedTotal || !postsTotal) return null

  return <div className={classes.root}>
      <div className={classes.inner}>
        <div className={classes.text}>
          <Link to={"/posts/uqXQAWxLFW8WgShtk/open-call-for-taggers"}>
            Tagging Progress
          </Link>
          <LWTooltip title="Click to see a list of the most important posts to tag.">
            <PostsItem2MetaInfo>
              <a className={classes.link} href={"https://docs.google.com/spreadsheets/d/1Oiv_Mg_7mEhP0Ik6Bs1V99G2v4eevL-LvkxQfD-blqw/edit#gid=651704611&fvid=2065958119"}>
                Tag Priority Posts
              </a>
            </PostsItem2MetaInfo>
          </LWTooltip>
        </div>
        <LWTooltip 
          className={classes.tooltip}
          title={<div>
            <div>{taggedTotal} out of {postsTotal} posts have been tagged</div>
            <div><em>(Filtered for 25+ karma. Only counting non-core tags (i.e. tags other than "Rationality", "AI", etc)</em></div>
          </div>}
        >
          <LinearProgress variant="buffer" value={(taggedTotal/postsTotal)*100} />
      </LWTooltip>
      </div>
  </div>
}

const TagProgressBarComponent = registerComponent("TagProgressBar", TagProgressBar, {styles, hocs:[withErrorBoundary]});

declare global {
  interface ComponentTypes {
    TagProgressBar: typeof TagProgressBarComponent
  }
}

