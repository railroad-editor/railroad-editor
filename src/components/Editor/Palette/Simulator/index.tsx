import * as React from 'react'

export interface SimulatorProps {
  // layers: string[]
  // visible: boolean[]
  // activeLayer: string
  // setActiveLayer: (layer: string) => void
  // setLayerVisible: (visible: boolean[]) => void
  // value: string
  // setPlatteMode: string
}


export class Simulator extends React.Component<SimulatorProps, {}> {

  constructor(props: SimulatorProps) {
    super(props)
  }

  render() {
    return (
      <section>
      </section>
    )
  }
}

// const mapStateToProps = (state: RootState) => {
//   return {
//     activeLayer: state.layers.activeLayer,
//     visible: state.layers.visible
//   }
// };
//
// const mapDispatchToProps = dispatch => {
//   return {
//     setActiveLayer: (layer: string) => dispatch(setActiveLayer(layer)),
//     setLayerVisible: (visible: boolean[]) => dispatch(setLayerVisible(visible))
//   }
// };
//
// export default connect(mapStateToProps, mapDispatchToProps)(LayerPalette)
