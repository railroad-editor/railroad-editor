import {
  CrossingRail,
  CurvedTurnout,
  CurveRail,
  DoubleCrossTurnout,
  DoubleCurveRail,
  DoubleStraightRail,
  EndRail,
  GappedStraightRail,
  RailGroup,
  RailGroupProps,
  SimpleTurnout,
  StraightRail,
  ThreeWayTurnout,
  WyeTurnout
} from "react-rail-components";
import StraightRailContainer from "containers/rails/StraightRail";
import CurveRailContainer from "containers/rails/CurveRail";
import DoubleStraightRailContainer from "containers/rails/DoubleStraightRail";
import GappedStraightRailContainer from "containers/rails/GappedStraightRail";
import DoubleCurveRailContainer from "containers/rails/DoubleCurveRail";
import DoubleCrossTurnoutContainer from "containers/rails/DoubleCrossTurnout";
import SimpleTurnoutContainer from "containers/rails/SimpleTurnout";
import WyeTurnoutContainer from "containers/rails/WyeTurnout";
import CurvedTurnoutContainer from "containers/rails/CurvedTurnout";
import ThreeWayTurnoutContainer from "containers/rails/ThreeWayTurnout";
import EndRailContainer from "containers/rails/EndRail";
import CrossingRailContainer from "containers/rails/CrossingRail";
import {RailBaseProps} from "react-rail-components/lib/RailBase";

// クラス名の文字列とクラスオブジェクトを関連付ける連想配列
// 新しいレールクラスを作成したらここに追加する必要がある
const RailContainerClasses = {
  StraightRail: StraightRailContainer,
  CurveRail: CurveRailContainer,
  DoubleStraightRail: DoubleStraightRailContainer,
  DoubleCurveRail: DoubleCurveRailContainer,
  SimpleTurnout: SimpleTurnoutContainer,
  WyeTurnout: WyeTurnoutContainer,
  CurvedTurnout: CurvedTurnoutContainer,
  ThreeWayTurnout: ThreeWayTurnoutContainer,
  DoubleCrossTurnout: DoubleCrossTurnoutContainer,
  EndRail: EndRailContainer,
  GappedStraightRail: GappedStraightRailContainer,
  CrossingRail: CrossingRailContainer,
  RailGroup: RailGroup
}

export const RailComponentClasses = {
  StraightRail,
  CurveRail,
  DoubleStraightRail,
  GappedStraightRail,
  DoubleCurveRail,
  SimpleTurnout,
  WyeTurnout,
  CurvedTurnout,
  ThreeWayTurnout,
  DoubleCrossTurnout,
  EndRail,
  CrossingRail
}

export default RailContainerClasses


// TODO: RailProps の方がわかりやすい名前では？
export type RailData = RailBaseProps | any


export interface RailGroupData extends RailGroupProps {
  rails: number[]
}

export interface RailItemData {
  type: string
  name: string

  [x: string]: any
}
