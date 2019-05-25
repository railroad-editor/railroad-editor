import * as React from "react";
import getLogger from "logging";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON} from "constants/stores";
import {BuilderStore, PlacingMode} from "store/builderStore";
import {Tools} from "constants/tools";
import {CommonStore} from "store/commonStore";
import {EditorMode} from "store/uiStore";
import DistantPlacingDialog from "./DistantPlacingDialog/DistantPlacingDialog";

const LOGGER = getLogger(__filename)

export interface DistantRailPlacerProps {
    common?: CommonStore
    builder?: BuilderStore
}

export interface DistantRailPlacerState {
}


@inject(STORE_COMMON, STORE_BUILDER)
@observer
export class DistantRailPlacer extends React.Component<DistantRailPlacerProps, DistantRailPlacerState> {

    constructor(props: DistantRailPlacerProps) {
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
                    <DistantPlacingDialog
                        title={'Distance from the joint'}
                        open={this.props.builder.freePlacingDialog}
                        onClose={this.onCloseDialog}
                    />
                }
            </>)
    }
}

export default compose<DistantRailPlacerProps, DistantRailPlacerProps|any>(
)(DistantRailPlacer)
