import * as React from "react";
import getLogger from "logging";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON} from "constants/stores";
import {BuilderStore, PlacingMode} from "store/builderStore";
import {Tools} from "constants/tools";
import {CommonStore} from "store/commonStore";
import {EditorMode} from "store/uiStore";
import FreePlacingDialog from "./FreePlacingDialog/FreePlacingDialog";

const LOGGER = getLogger(__filename)

export interface DiffRailPlacerProps {
    common?: CommonStore
    builder?: BuilderStore
}

export interface DiffRailPlacerState {
}


@inject(STORE_COMMON, STORE_BUILDER)
@observer
export class DiffRailPlacer extends React.Component<DiffRailPlacerProps, DiffRailPlacerState> {

    constructor(props: DiffRailPlacerProps) {
        super(props)
        this.state = {
        }

        this.onCloseDialog = this.onCloseDialog.bind(this)
    }

    onCloseDialog = () => {
        this.props.builder.setFreePlacingDialog(false)
    }

    render() {
        // パンツール使用中は何もしない
        if (this.props.builder.activeTool === Tools.PAN) {
            return null
        }

        return (
            <>
                {
                    this.props.common.editorMode === EditorMode.BUILDER &&
                    this.props.builder.placingMode === PlacingMode.FREE &&
                    <FreePlacingDialog
                        title={'Difference'}
                        open={this.props.builder.freePlacingDialog}
                        onClose={this.onCloseDialog}
                    />
                }
            </>)
    }
}

export default compose<DiffRailPlacerProps, DiffRailPlacerProps|any>(
)(DiffRailPlacer)
