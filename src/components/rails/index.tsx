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
import StraightRailContainer from "components/rails/StraightRail";
import CurveRailContainer from "components/rails/CurveRail";
import DoubleStraightRailContainer from "components/rails/DoubleStraightRail";
import GappedStraightRailContainer from "components/rails/GappedStraightRail";
import DoubleCurveRailContainer from "components/rails/DoubleCurveRail";
import DoubleCrossTurnoutContainer from "components/rails/DoubleCrossTurnout";
import SimpleTurnoutContainer from "components/rails/SimpleTurnout";
import WyeTurnoutContainer from "components/rails/WyeTurnout";
import CurvedTurnoutContainer from "components/rails/CurvedTurnout";
import ThreeWayTurnoutContainer from "components/rails/ThreeWayTurnout";
import EndRailContainer from "components/rails/EndRail";
import CrossingRailContainer from "components/rails/CrossingRail";
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
