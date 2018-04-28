import {RootState} from "store/type";
import {LayerPaletteProps} from "components/Editor/LayerPalette/LayerPalette";
import {currentLayoutData, nextLayerId} from "selectors";
import {setActiveLayer} from "actions/builder";
import {LayerData} from "reducers/layout";
import {addLayer, deleteLayer, updateLayer} from "actions/layout";
import {connect} from "react-redux";
import {LayerSettingDialog} from "components/Editor/LayerPalette/LayerSettingDialog/LayerSettingDialog";

const mapStateToProps = (state: RootState): Partial<LayerPaletteProps> => {
  return {
    layers: currentLayoutData(state).layers,
    activeLayerId: state.builder.activeLayerId,
    nextLayerId: nextLayerId(state)
  }
}

const mapDispatchToProps = (dispatch): Partial<LayerPaletteProps>  => {
  return {
    setActiveLayer: (layerId: number) => dispatch(setActiveLayer(layerId)),
    updateLayer: (item: Partial<LayerData>) => dispatch(updateLayer({item})),
    addLayer: (item: LayerData) => dispatch(addLayer({item})),
    deleteLayer: (id: number) => dispatch(deleteLayer({id}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LayerSettingDialog)
