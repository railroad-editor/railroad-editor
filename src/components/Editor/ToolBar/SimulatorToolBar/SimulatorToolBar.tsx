// import * as React from 'react'
// import {Grid} from '@material-ui/core'
// import {Tools} from "constants/tools";
// import getLogger from "logging";
// import {LayoutStore} from "store/layoutStore";
// import {inject, observer} from "mobx-react";
// import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
// import {PlacingMode, SimulatorStore} from "store/builderStore";
// import {CommonStore} from "store/commonStore";
// import {compose} from "recompose";
// import Peer from 'skyway-js';
// import {LayoutLogicStore} from "store/layoutLogicStore";
//
// const LOGGER = getLogger(__filename)
//
//
// export interface SimulatorToolBarProps {
//   common?: CommonStore
//   builder?: SimulatorStore
//   layout?: LayoutStore
//   layoutLogic?: LayoutLogicStore
//
//   resetViewPosition: () => void
//   snackbar: any
// }
//
// export interface SimulatorToolBarState {
//   openMenu: boolean
//   openSettings: boolean
//   el: HTMLElement | undefined
// }
//
// type EnhancedSimulatorToolBarProps = SimulatorToolBarProps & WithSimulatorPublicProps
//
//
//
// @inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC)
// @observer
// export class SimulatorToolBar extends React.Component<EnhancedSimulatorToolBarProps, SimulatorToolBarState> {
//
//   myPeerId: string
//   peer: Peer
//   targetPeerId: string
//   conn: any
//
//   constructor(props: EnhancedSimulatorToolBarProps) {
//     super(props)
//     this.state = {
//       openMenu: false,
//       openSettings: false,
//       el: undefined,
//     }
//   }
//
//   componentDidMount() {
//     this.peer = new Peer({
//       key: '423ec210-715b-4916-971f-bd800a835414',
//       debug: 3,
//     });
//     // Show this peer's ID.
//     this.peer.on('open', id => {
//       this.myPeerId = id
//       console.log('open', this.myPeerId)
//     });
//
//   }
//
//   isActive(tool: string) {
//     return this.props.builder.activeTool === tool
//   }
//
//   onClickSimulatorItem = (tool: Tools) => (e: MouseEvent) => {
//     this.props.builder.setActiveTool(tool)
//     // 最後に選択していたアイテムを選択する
//     this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[tool])
//   }
//
//
//   openMenu = (e) => {
//     LOGGER.info(this.props.layout.meta)
//     this.setState({
//       openMenu: true,
//     })
//   }
//
//   closeMenu = () => {
//     this.setState({
//       openMenu: false,
//     })
//   }
//
//   openSettingsDialog = (e) => {
//     this.setState({
//       openSettings: true
//     })
//   }
//
//   closeSettingsDialog = () => {
//     this.setState({
//       openSettings: false
//     })
//   }
//
//   setLayoutName = (text: string) => {
//     this.props.layout.updateLayoutMeta({
//       name: text
//     })
//   }
//
//   onChangePlacingMode = (mode: PlacingMode) => (e) => {
//     this.props.builder.setPlacingMode(mode)
//   }
//
//   connectWebRTC = () => {
//     const connectedPeers = {};
//     const requestedPeer = "C1yv3nGCQGzgdcFs"
//     if (!connectedPeers[requestedPeer]) {
//       this.conn = this.peer.connect(requestedPeer, {
//         label:    'chat',
//         metadata: {message: 'hi i want to chat with you!'},
//       });
//       this.conn.on('open', (id) => {
//         console.log('open', id)
//       });
//       this.conn.on('error', err => alert(err));
//
//       this.conn.on('data', data => {
//         console.log('data', data)
//       });
//
//       this.conn.on('close', () => {
//       });
//     }
//   }
//
//   sendSomething = () => {
//     this.conn.send('hello!')
//   }
//
//
//   render() {
//     return (
//       <Grid xs alignItems="center" style={{display: 'flex'}}>
//       </Grid>
//     )
//   }
// }
//
//
// export default compose<SimulatorToolBarProps, SimulatorToolBarProps>(
//   withSimulator
// )(SimulatorToolBar)
