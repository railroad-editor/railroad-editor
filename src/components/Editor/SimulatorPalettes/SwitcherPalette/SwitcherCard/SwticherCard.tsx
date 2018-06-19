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
  NarrowCardContent, NarrowCardHeader, ActiveSmallButton,
} from "components/Editor/SimulatorPalettes/SwitcherPalette/SwitcherCard/SwitchCard.style";
import DeleteIcon from '@material-ui/icons/Delete';
import RailIcon from "components/common/RailIcon/RailIcon";
import {RailComponentClasses, RailData} from "components/rails/index";
import SimpleTurnout, {SimpleTurnoutProps} from "components/rails/SimpleTurnout/SimpleTurnout";
import DoubleCrossTurnout, {DoubleCrossTurnoutProps} from "components/rails/DoubleCrossTurnout/DoubleCrossTurnout";
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css'
import {getRailComponent} from "components/rails/utils";
import ThreeWayTurnout, {ThreeWayTurnoutProps} from "components/rails/ThreeWayTurnout/ThreeWayTurnout";


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

  static DEBOUNCE_THRESHOLD = 5

  debounceCount: number
  dragging: boolean
  stateGridLayout: object[]

  constructor(props: SwitcherCardProps) {
    super(props)
    this.state = {
      anchorEl: null,
      sliderValue: 0,
      sliderDragging: false,
      direction: true,
      dialogOpen: false,
    }

    this.dragging = false
    this.debounceCount = 0

    // SwitcherのStateとTurnoutのConductionStateの関連付けを制御するデータ
    // x がSwitcherのState, i がレールのConductionStateに対応する
    switch (props.item.type) {
      case SwitcherType.NORMAL:
        this.stateGridLayout = [
          {i: '0', x: 0, y: 0, w: 1, h: 1},
          {i: '1', x: 1, y: 0, w: 1, h: 1},
        ]
        break
      case SwitcherType.THREE_WAY:
        this.stateGridLayout = [
          {i: '0', x: 0, y: 0, w: 1, h: 1},
          {i: '1', x: 1, y: 0, w: 1, h: 1},
          {i: '2', x: 2, y: 0, w: 1, h: 1},
        ]
        break
    }
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
   * SwitcherのConductionStatesを、このコンポーネントで表示するための形式に変換する。
   *
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
   * }
   *
   * @param {ConductionStates} conductionStates
   * @returns {{}}
   */
  transformSwitcherConductionStates = (conductionStates: ConductionStates): InversedConductionStates => {
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

  /**
   * 変換したSwitcherのConductionStatesをもとに戻す。
   * @param {InversedConductionStates} inversedConductionStates
   * @returns {ConductionStates}
   */
  revertSwitcherConductionStates = (inversedConductionStates: InversedConductionStates): ConductionStates => {
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


  onSwitcherStateChange = (state: number) => (e) => {
    // ドラッグ直後のクリックイベントも発生するので、ドラッグ中かどうか判断する
    if (!this.dragging) {
      this.props.layoutLogic.changeSwitcherState(this.props.item.id, state)
    }
    this.dragging = false
    this.debounceCount = 0
  }

  onDisconnect = (railId: number) => (e) => {
    this.props.layoutLogic.disconnectTurnoutFromSwitcher(Number(railId))
  }

  onStateGridLayoutChange = (railId: number) => (stateGridLayout) => {
    LOGGER.info(stateGridLayout)
    const transformedConductionStates = this.transformSwitcherConductionStates(this.props.item.conductionStates)

    // GridLayoutの変更を、変換されたConductionStatesに反映する
    switch (this.props.item.type) {
      case SwitcherType.NORMAL:
        transformedConductionStates[railId] = {
          0: stateGridLayout[0]['x'],
          1: stateGridLayout[1]['x']
        }
        break
      case SwitcherType.THREE_WAY:
        transformedConductionStates[railId] = {
          0: stateGridLayout[0]['x'],
          1: stateGridLayout[1]['x'],
          2: stateGridLayout[2]['x']
        }
        break
    }

    // LOGGER.info('rail', railId, 'table changed!!', switchStateTable)
    // ConductionStatesを元に戻し、Switcherの状態を変更する
    const switchStateTable = this.revertSwitcherConductionStates(transformedConductionStates)
    this.props.layoutLogic.changeSwitcherConductionTable(this.props.item.id, switchStateTable)
  }

  onDrag = (e) => {
    // クリックしてから一定以上ドラッグされた時に初めて矩形を表示する
    if (this.debounceCount < SwitcherCard.DEBOUNCE_THRESHOLD) {
      this.debounceCount += 1
      return
    }
    this.dragging = true
  }


  createStateTable = (switcher: SwitcherData, rail: RailData) => {
    const railConductionStates = switcher.conductionStates[switcher.currentState]
    // _.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId && cs.conductionState === 0)))
    // LOGGER.info('rail', rail.id, rail.conductionState)
    // LOGGER.info('railConductionStates', railConductionStates)
    // LOGGER.info('active 0', railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === 0))
    // LOGGER.info('active 1', railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === 1))
    // LOGGER.info('onClick 0' , Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === 0)))))
    // LOGGER.info('onClick 1' , Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === 1)))))

    switch (switcher.type) {
      case SwitcherType.NORMAL:
        return (
          <GridLayout className="layout" layout={this.stateGridLayout}
                      cols={2} rowHeight={50} width={120} isResizable={false}
                      compactType="horizontal" margin={[0, 0]}
                      onLayoutChange={this.onStateGridLayoutChange(rail.id)}
                      onDrag={this.onDrag}
          >
            {
              _.range(0, 2).map(conductionState => {
                return (
                  <ActiveSmallButton
                    // このセルのIdentity、つまりこのレールのConductionState
                    key={`${conductionState}`}  //`
                    //
                    active={!!railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === conductionState)}
                    onClick={this.onSwitcherStateChange(
                      Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === conductionState)))))}
                  >
                    <RailIcon
                      width={30}
                      height={30}
                      rail={createRailComponentForIcon(rail, conductionState)}
                    />
                  </ActiveSmallButton>
                )
              })
            }
          </GridLayout>
        )
      // TODO: Implement
      case SwitcherType.THREE_WAY:
        return (
          <GridLayout className="layout" layout={this.stateGridLayout}
                      cols={3} rowHeight={50} width={120} isResizable={false}
                      compactType="horizontal" margin={[0, 0]}
                      onLayoutChange={this.onStateGridLayoutChange(rail.id)}
                      onDrag={this.onDrag}
          >
            {
              _.range(0, 3).map(conductionState => {
                return (
                  <ActiveSmallButton
                    // このセルのIdentity、つまりこのレールのConductionState
                    key={`${conductionState}`}  //`
                    //
                    active={!!railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === conductionState)}
                    onClick={this.onSwitcherStateChange(
                      Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === conductionState)))))}
                  >
                    <RailIcon
                      width={25}
                      height={25}
                      rail={createRailComponentForIcon(rail, conductionState)}
                    />
                  </ActiveSmallButton>
                )
              })
            }
          </GridLayout>
        )
    }
  }


  render() {
    const {name, type, conductionStates} = this.props.item
    const transformedConductionStates = this.transformSwitcherConductionStates(conductionStates)

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
                  <Grid item xs={3} justify="flex-end">
                    <IconButton style={{width: '40px', height: '40px'}}
                      onClick={this.onDisconnect(railId)}
                    >
                      <DeleteIcon style={{width: '20px', height: '20px'}}/>
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


const iconizeSimpleTurnoutProps = (props: SimpleTurnoutProps) => {
  props.length = 70
  props.centerAngle = 30
  props.radius = 140
}

const iconizeDoubleCrossTurnoutProps = (props: DoubleCrossTurnoutProps) => {
  props.length = 70
  props.centerAngle = 60
}

const iconizeThreeWayTurnoutProps = (props: ThreeWayTurnoutProps) => {
  props.length = 70
  props.rightCenterAngle = 30
  props.rightRadius = 140
  props.leftCenterAngle = 30
  props.leftRadius = 140
}


export const createRailComponentForIcon = (item: RailData, conductionState: number) => {
  const {id: id, type: type, ...props} = item
  let RailContainer = RailComponentClasses[type]
  if (RailContainer == null) {
    throw Error(`'${type}' is not a valid Rail type!`)
  }

  switch (RailContainer) {
    case SimpleTurnout:
      iconizeSimpleTurnoutProps(props as SimpleTurnoutProps)
      break
    case DoubleCrossTurnout:
      iconizeDoubleCrossTurnoutProps(props as DoubleCrossTurnoutProps)
      break
    case ThreeWayTurnout:
      iconizeThreeWayTurnoutProps(props as ThreeWayTurnoutProps)
      break
  }

  const globalAngle = getRailComponent(item.id).railPart.getJointAngleToParent(1)
  LOGGER.info('angle', globalAngle)

  return (
    <RailContainer
      // key={id}
      // id={id}
      {...props}
      angle={globalAngle}
      conductionState={conductionState}
      fillColors={{[conductionState]: 'orange'}}
      opacity={1.0}
      showGap={false}
      showJoints={false}
    />
  )
}
