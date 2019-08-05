import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles/index';
import Grid from '@material-ui/core/Grid/index';
import LayoutBody from "../common/LayoutBody";
import Typography from "@material-ui/core/Typography";
import productCurvyLines from "./productCurvyLines.png"
import BuildIcon from '@material-ui/icons/Build';
import CloudIcon from "@material-ui/icons/Cloud";
import AccessibilityIcon from "@material-ui/icons/Accessibility";

const styles = theme => ({
  root: {
    display: 'flex',
    overflow: 'hidden',
    backgroundColor: '#e4edf3'
  },
  layoutBody: {
    marginTop: theme.spacing.unit * 15,
    marginBottom: theme.spacing.unit * 25,
    display: 'flex',
    position: 'relative',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `0px ${theme.spacing.unit * 5}px`,
  },
  image: {
    height: 55,
  },
  title: {
    marginTop: theme.spacing.unit * 5,
    marginBottom: theme.spacing.unit * 5,
  },
  curvyLines: {
    pointerEvents: 'none',
    position: 'absolute',
    top: -180,
  },
  productIcon: {
    fontSize: '60px'
  }
});

function ProductValues(props) {
  const {classes} = props;

  return (
    <section className={classes.root}>
      <LayoutBody className={classes.layoutBody} width="large">
        <img
          src={productCurvyLines}
          className={classes.curvyLines}
          alt="curvy lines"
        />
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <div className={classes.item}>
              <BuildIcon className={classes.productIcon}/>
              <Typography variant="h5" className={classes.title}>
                Easy to Use
              </Typography>
              <Typography variant="h6">
                {'使いやすいデザインで、すぐにレイアウト設計を始められます'}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div className={classes.item}>
              <CloudIcon className={classes.productIcon}/>
              <Typography variant="h5" className={classes.title}>
                Cloud Native
              </Typography>
              <Typography variant="h6">
                {'レイアウトデータはオンラインストレージに保存され、いつでも取り出せます'}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div className={classes.item}>
              <AccessibilityIcon className={classes.productIcon}/>
              <Typography variant="h5" className={classes.title}>
                Beautiful UI
              </Typography>
              <Typography variant="h6">
                {'モダンで美しいUIデザインです'}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </LayoutBody>
    </section>
  );
}

ProductValues.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ProductValues);
