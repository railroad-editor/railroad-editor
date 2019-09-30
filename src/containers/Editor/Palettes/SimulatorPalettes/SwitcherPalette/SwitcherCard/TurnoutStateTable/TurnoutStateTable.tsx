import * as React from 'react'
import getLogger from "logging";
import {ConductionStates, SwitcherData, SwitcherType} from "store/layoutStore";
import {inject, observer} from 'mobx-react';
import {STORE_LAYOUT, USECASE_POWERPACK, USECASE_SWITCHER} from "constants/stores";
import RailIcon from "components/RailIcon/RailIcon";
import {RailComponentClasses, RailData} from "containers/rails/index";
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css'
import {getRailComponent} from "containers/rails/utils";
import {InversedConductionStates} from "containers/Editor/Palettes/SimulatorPalettes/SwitcherPalette/SwitcherCard/SwticherCard";
import {ActiveSmallButton} from "containers/Editor/Palettes/SimulatorPalettes/SwitcherPalette/SwitcherCard/SwitchCard.style";
import {
  DoubleCrossTurnout,
  DoubleCrossTurnoutProps,
  SimpleTurnout,
  SimpleTurnoutProps,
  ThreeWayTurnout,
  ThreeWayTurnoutProps
} from "react-rail-components";
import {WithPowerPackUseCase, WithSwitcherUseCase} from "../../../../../../../usecase";
import {WithLayoutStore} from "../../../../../../../store";


const LOGGER = getLogger(__filename)


export type TurnoutStateTableProps = {
  switcher: SwitcherData
  rail: RailData
} & WithLayoutStore & WithPowerPackUseCase & WithSwitcherUseCase


@inject(STORE_LAYOUT, USECASE_POWERPACK, USECASE_SWITCHER)
@observer
export class TurnoutStateTable extends React.Component<TurnoutStateTableProps, {}> {

  static DEBOUNCE_THRESHOLD = 5

  dragging: boolean
  debounceCount: number
  initialStateGridLayout: object[]
  stateGridLayout: object[]

  constructor(props: TurnoutStateTableProps) {
    super(props)

    // SwitcherのStateとTurnoutのConductionStateの関連付けを制御するデータ
    // x がSwitcherのState, i がレールのConductionStateに対応する
    switch (props.switcher.type) {
      case SwitcherType.NORMAL:
        this.initialStateGridLayout = this.stateGridLayout = [
          {i: '0', x: 0, y: 0, w: 1, h: 1},
          {i: '1', x: 1, y: 0, w: 1, h: 1},
        ]
        break
      case SwitcherType.THREE_WAY:
        this.initialStateGridLayout = this.stateGridLayout = [
          {i: '0', x: 0, y: 0, w: 1, h: 1},
          {i: '1', x: 1, y: 0, w: 1, h: 1},
          {i: '2', x: 2, y: 0, w: 1, h: 1},
        ]
        break
    }
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
    if (! this.dragging) {
      this.props.switcherUseCase.changeSwitcherState(this.props.switcher.id, state)
    }
    this.dragging = false
    this.debounceCount = 0
  }

  onStateGridLayoutChange = (railId: number) => (stateGridLayout) => {
    LOGGER.info(stateGridLayout)
    // レイアウトが変わらない場合でもここが呼ばれてしまうので、差分があるのか調べる
    const isEqual = _.isEqualWith(this.stateGridLayout, stateGridLayout, (value, newValue) =>
      _.range(value.length).map(i => _.isEqual(_.pick(value[i], 'i', 'x'), _.pick(newValue[i], 'i', 'x'))).every(e => e))

    if (isEqual) {
      LOGGER.info('No grid layout change', this.stateGridLayout, stateGridLayout)
      return
    }

    const transformedConductionStates = this.transformSwitcherConductionStates(this.props.switcher.conductionStates)

    // GridLayoutの変更を、変換されたConductionStatesに反映する
    switch (this.props.switcher.type) {
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
    this.props.switcherUseCase.changeSwitcherConductionTable(this.props.switcher.id, switchStateTable)

    this.stateGridLayout = _.cloneDeep(stateGridLayout)
  }

  onDrag = (e) => {
    // クリックしてから一定以上ドラッグされた時に初めて矩形を表示する
    if (this.debounceCount < TurnoutStateTable.DEBOUNCE_THRESHOLD) {
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
          <GridLayout className="layout" layout={this.initialStateGridLayout}
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
                    active={!! railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === conductionState)}
                    onClick={this.onSwitcherStateChange(
                      Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === conductionState)))))}
                    color="secondary"
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
          <GridLayout className="layout" layout={this.initialStateGridLayout}
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
                    active={!! railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === conductionState)}
                    onClick={this.onSwitcherStateChange(
                      Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === conductionState)))))}
                    color="secondary"
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


  // TODO: きれいにする
  render() {
    const {switcher, rail} = this.props
    const railConductionStates = switcher.conductionStates[switcher.currentState]

    switch (switcher.type) {
      case SwitcherType.NORMAL:
        return (
          <GridLayout className="layout" layout={this.initialStateGridLayout}
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
                    active={!! railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === conductionState)}
                    onClick={this.onSwitcherStateChange(
                      Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === conductionState)))))}
                    color="secondary"
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
          <GridLayout className="layout" layout={this.initialStateGridLayout}
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
                    active={!! railConductionStates.find(cond => cond.railId === rail.id && cond.conductionState === conductionState)}
                    onClick={this.onSwitcherStateChange(
                      Number(_.findKey(switcher.conductionStates, (css => css.find(cs => cs.railId === rail.id && cs.conductionState === conductionState)))))}
                    color="secondary"
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
