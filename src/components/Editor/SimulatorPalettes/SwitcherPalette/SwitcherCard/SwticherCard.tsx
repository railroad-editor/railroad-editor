import * as React from 'react'
import {CardHeader, Grid, MenuItem, Typography} from '@material-ui/core'
import {S3Image} from 'aws-amplify-react';
import getLogger from "logging";
import Menu from "@material-ui/core/Menu";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from "@material-ui/core/IconButton";
import Card from "@material-ui/core/Card";
import {ConductionStates, LayoutStore, SwitcherData, SwitcherType} from "store/layoutStore";
import {FeederInfo} from "components/rails/RailBase";
import {inject, observer} from 'mobx-react';
import {STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import {LayoutLogicStore} from "store/layoutLogicStore";
import SwitcherSettingDialog
  from "components/Editor/SimulatorPalettes/SwitcherPalette/SwitcherCard/SwitcherSettingDialog/SwitcherSettingDialog";
import {
  ActiveSmallButton,
  NarrowCardContent, NarrowCardHeader,
} from "components/Editor/SimulatorPalettes/SwitcherPalette/SwitcherCard/SwitchCard.style";
import DeleteIcon from '@material-ui/icons/Delete';
import RailIcon from "components/common/RailIcon/RailIcon";
import {RailComponentClasses, RailData} from "components/rails/index";
import SimpleTurnout from "components/rails/SimpleTurnout/SimpleTurnout";
import DoubleCrossTurnout from "components/rails/DoubleCrossTurnout/DoubleCrossTurnout";
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css'


const LOGGER = getLogger(__filename)


export interface SwitcherCardProps {
  item: SwitcherData
  feeders: FeederInfo[]
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore
}

export interface SwitcherCardState {
  anchorEl: HTMLElement
  sliderValue: number
  sliderDragging: boolean
  direction: boolean
  dialogOpen: boolean
  stateTableLayout: object
}

interface InversedConductionStates {
  [railId: number]: InversedConductionState
}

interface InversedConductionState {
  [switchState: number]: number     // Rail's conductionState
}



@inject(STORE_LAYOUT_LOGIC, STORE_LAYOUT)
@observer
export class SwitcherCard extends React.Component<SwitcherCardProps, SwitcherCardState> {

  _dragging: boolean

  constructor(props: SwitcherCardProps) {
    super(props)
    this.state = {
      anchorEl: null,
      sliderValue: 0,
      sliderDragging: false,
      direction: true,
      dialogOpen: false,
      stateTableLayout: [
        {i: '0', x: 0, y: 0, w: 1, h: 1},     // xがswitchStateの値, iがレールのconductionStateに対応する？
        {i: '1', x: 1, y: 0, w: 1, h: 1},
      ]
    }

    this._dragging = false
  }

  openMenu = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: e.currentTarget});
  }

  onMenuClose = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: null})
  }

  onSetting = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({
      dialogOpen: true
    })
    this.onMenuClose(e)
  }

  onSettingDialogClosed = () => {
    this.setState({
      dialogOpen: false
    })
  }

  onDelete = (e: React.MouseEvent<HTMLElement>) => {
    this.props.layout.deleteSwitcher({
      id: this.props.item.id
    })
    this.onMenuClose(e)
  }

  /**
   * {
   *   [railId]: {
   *     [switchState]: [railConductionState],
   *     ...
   *   }
   *
   *   1: {
   *     0: 0,
   *     1: 1
   *   },
   *   2: {
   *     0: 1,
   *     1: 0
   *   }
   *
   * @param {ConductionStates} conductionStates
   * @returns {{}}
   */
  transformConductionStates = (conductionStates: ConductionStates): InversedConductionStates => {
    const rails = {}
    _.keys(conductionStates).forEach(stateIdxStr => {
      const stateIdx = Number(stateIdxStr)
      conductionStates[stateIdx].forEach(state => {
        if (! rails[state.railId]) {
          rails[state.railId] = {}
        }
        rails[state.railId][stateIdx] = state.conductionState
      })
    })
    return rails
  }

  detransformConductionStates = (inversedConductionStates: InversedConductionStates): ConductionStates => {
    const switchStates = {}
    _.keys(inversedConductionStates).forEach(railIdStr => {
      const railId = Number(railIdStr)
      _.keys(inversedConductionStates[railId]).forEach(switchStateStr => {
        const switchState = Number(switchStateStr)
        if (! switchStates[switchState]) {
          switchStates[switchState] = []
        }
        switchStates[switchState].push({
          railId: railId,
          conductionState: inversedConductionStates[railId][switchState]
        })
      })
    })

    return switchStates
  }



  onSwitchStateChange = (state: number) => (e) => {
    // ドラッグ直後のクリックイベントも発生するので、ドラッグ中かどうか判断する
    if (!this._dragging) {
      this.props.layoutLogic.changeSwitcherState(this.props.item.id, state)
    }
    this._dragging = false
  }

  onDisconnectRail = (railId: number) => (e) => {
    this.props.layoutLogic.disconnectTurnoutFromSwitcher(Number(railId), this.props.item.id)
  }

  onStateTableChange = (railId: number) => (stateTableLayout) => {
    LOGGER.info(stateTableLayout)
    const transformedConductionStates = this.transformConductionStates(this.props.item.conductionStates)

    transformedConductionStates[railId] = {
      0: stateTableLayout[0]['x'],
      1: stateTableLayout[1]['x']
    }

    const switchStateTable = this.detransformConductionStates(transformedConductionStates)

    LOGGER.info('rail', railId, 'table changed!!', switchStateTable)

    this.props.layoutLogic.changeSwitcherConductionTable(this.props.item.id, switchStateTable)
  }

  onDrag = (e) => {
    this._dragging = true
  }


  createStateTable = (switcher: SwitcherData, rail: RailData) => {
    const railConductionStates = switcher.conductionStates[switcher.currentState]
    // _.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId && cs.conductionState === 0)))
    LOGGER.info('rail', rail.id, rail.conductionState)
    LOGGER.info('railConductionStates', railConductionStates)
    LOGGER.info('active 0', railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === 0))
    LOGGER.info('active 1', railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === 1))
    LOGGER.info('onClick 0' , Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === 0)))))
    LOGGER.info('onClick 1' , Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === 1)))))


    switch (switcher.type) {
      case SwitcherType.NORMAL:
        return (
          <GridLayout className="layout" layout={this.state.stateTableLayout}
                      cols={2} rowHeight={50} width={120} isResizable={false}
                      compactType="horizontal" margin={[0, 0]}
                      onLayoutChange={this.onStateTableChange(rail.id)}
                      onDrag={this.onDrag}
          >
            <ActiveSmallButton
              // このセルのIdentity、つまりこのレールのConductionState
              key={"0"}
              //
              active={!!railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === 0)}
              onClick={this.onSwitchStateChange(Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === 0)))))}
            >
              <RailIcon
                width={30}
                height={30}
                rail={createRailComponentForIcon(rail, 0)}
              />
            </ActiveSmallButton>
            <ActiveSmallButton
              key={"1"}  //` このセルのIdentityはレールのConductionStateである
              active={!!railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === 1)}
              onClick={this.onSwitchStateChange(Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === 1)))))}
            >
              <RailIcon
                width={30}
                height={30}
                rail={createRailComponentForIcon(rail, 1)}
              />
            </ActiveSmallButton>
          </GridLayout>
        )
      case SwitcherType.THREE_WAY:
        return (
          <GridLayout className="layout" layout={this.state.stateTableLayout}
                      cols={3} rowHeight={50} width={120} isResizable={false}
                      compactType="horizontal" margin={[0, 0]}
                      onLayoutChange={this.onStateTableChange(rail.id)}
          >
            <ActiveSmallButton
              key="a"
              active={this.props.item.currentState === 0}
              onClick={this.onSwitchStateChange(0)}
            >
              <RailIcon
                width={30}
                height={30}
                rail={createRailComponentForIcon(rail, 0)}
              />
            </ActiveSmallButton>
            <ActiveSmallButton
              key="b"
              active={this.props.item.currentState === 1}
              onClick={this.onSwitchStateChange(1)}
            >
              <RailIcon
                width={30}
                height={30}
                rail={createRailComponentForIcon(rail, 1)}
              />
            </ActiveSmallButton>
            <ActiveSmallButton
              key="c"
              active={this.props.item.currentState === 2}
              onClick={this.onSwitchStateChange(2)}
            >
              <RailIcon
                width={30}
                height={30}
                rail={createRailComponentForIcon(rail, 2)}
              />
            </ActiveSmallButton>
          </GridLayout>
        )
    }

  }


  render() {
    const {name, type, conductionStates} = this.props.item
    const transformedConductionStates = this.transformConductionStates(conductionStates)

    LOGGER.info('conductionStates', conductionStates)
    LOGGER.info('transformedConductionStates', transformedConductionStates)


    return (
      <>
        <Card>
          <NarrowCardHeader
            title={name}
            action={
              <IconButton
                onClick={this.openMenu}
              >
                <MoreVertIcon/>
              </IconButton>
            }
            // style={{paddingTop: '16px', paddingBottom: '8px'}}
          />
          <NarrowCardContent>
            {_.keys(transformedConductionStates).map(railIdStr => {
              const railId = Number(railIdStr)
              const rail = this.props.layout.getRailDataById(railId)
              return (
                <Grid container justify="center" alignItems="center" spacing={0}>
                  <Grid item xs={3}>
                    <Typography align="center"> {rail.name} </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {this.createStateTable(this.props.item, rail)}
                  </Grid>
                  <Grid item xs={3}>
                    <IconButton
                      onClick={this.onDisconnectRail(railId)}
                    >
                      <DeleteIcon/>
                    </IconButton>
                  </Grid>
                </Grid>
              )
            })}
          </NarrowCardContent>
        </Card>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.onMenuClose}
        >
          <MenuItem onClick={this.onSetting}>Setting</MenuItem>}
          <MenuItem onClick={this.onDelete}>Delete</MenuItem>}
        </Menu>
        <SwitcherSettingDialog
          title={'Switcher Settings'}
          open={this.state.dialogOpen}
          onClose={this.onSettingDialogClosed}
          switcher={this.props.item}
          updateSwitcher={this.props.layout.updateSwitcher}
        />
      </>
    )
  }
}


const iconizeSimpleTurnoutProps = (props) => {
  props.length = 70
  props.centerAngle = 30
  props.radius = 140
}

const iconizeDoubleCrossTurnoutProps = (props) => {
  props.length = 70
  props.centerAngle = 60
}


export const createRailComponentForIcon = (item: RailData, conductionState: number) => {
  const {id: id, type: type, ...props} = item
  let RailContainer = RailComponentClasses[type]
  if (RailContainer == null) {
    throw Error(`'${type}' is not a valid Rail type!`)
  }

  switch (RailContainer) {
    case SimpleTurnout:
      iconizeSimpleTurnoutProps(props)
      break
    case DoubleCrossTurnout:
      iconizeDoubleCrossTurnoutProps(props)
      break
  }

  return (
    <RailContainer
      // key={id}
      // id={id}
      {...props}
      conductionState={conductionState}
      fillColors={{[conductionState]: 'orange'}}
      opacity={1.0}
      showGap={false}
      showJoints={false}
    />
  )
}
