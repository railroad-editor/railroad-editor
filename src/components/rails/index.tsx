import StraightRail, {StraightRailProps} from "./StraightRail/StraightRail";
import StraightRailContainer from "components/rails/StraightRail";
import CurveRail, {CurveRailProps} from "components/rails/CurveRail/CurveRail";
import CurveRailContainer from "components/rails/CurveRail";
import DoubleStraightRail, {DoubleStraightRailProps} from "components/rails/DoubleStraightRail/DoubleStraightRail";
import DoubleStraightRailContainer from "components/rails/DoubleStraightRail";
import GappedStraightRail, {GappedStraightRailProps} from "./GappedStraightRail/GappedStraightRail";
import GappedStraightRailContainer from "components/rails/GappedStraightRail";
import DoubleCurveRail from "components/rails/DoubleCurveRail/DoubleCurveRail";
import DoubleCurveRailContainer from "components/rails/DoubleCurveRail";
import DoubleCrossTurnout, {DoubleCrossTurnoutProps} from "components/rails/DoubleCrossTurnout/DoubleCrossTurnout";
import DoubleCrossTurnoutContainer from "components/rails/DoubleCrossTurnout";
import SimpleTurnout, {SimpleTurnoutProps} from "components/rails/SimpleTurnout/SimpleTurnout";
import SimpleTurnoutContainer from "components/rails/SimpleTurnout";
import WyeTurnout, {WyeTurnoutProps} from "components/rails/WyeTurnout/WyeTurnout";
import WyeTurnoutContainer from "components/rails/WyeTurnout";
import CurvedTurnout from "components/rails/CurvedTurnout/CurvedTurnout";
import CurvedTurnoutContainer from "components/rails/CurvedTurnout";
import ThreeWayTurnout, {ThreeWayTurnoutProps} from "components/rails/ThreeWayTurnout/ThreeWayTurnout";
import ThreeWayTurnoutContainer from "components/rails/ThreeWayTurnout";
import {RailBaseProps} from "components/rails/RailBase";
import EndRailContainer from "components/rails/EndRail";
import EndRail from "components/rails/EndRail/EndRail";
import CrossingRailContainer from "components/rails/CrossingRail";
import CrossingRail from "components/rails/CrossingRail/CrossingRail";
import RailGroup from "components/rails/RailGroup";
import {RailGroupProps} from "components/rails/RailGroup/RailGroup";
import StraightRailPart from "components/rails/parts/StraightRailPart";
import CurveRailPart from "components/rails/parts/CurveRailPart";
import DoubleStraightRailPart from "components/rails/parts/DoubleStraightRailPart";
import GappedStraightRailPart from "components/rails/parts/GappedStraightRailPart";
import DoubleCurveRailPart from "components/rails/parts/DoubleCurveRailPart";
import SimpleTurnoutRailPart from "components/rails/parts/SimpleTurnoutRailPart";
import WyeTurnoutRailPart from "components/rails/parts/WyeTurnoutRailPart";
import DoubleCrossTurnoutRailPart from "components/rails/parts/DoubleCrossTurnoutRailPart";
import CrossingRailPart from "components/rails/parts/CrossingRailPart";
import ThreeWayTurnoutRailPart from "components/rails/parts/ThreeWayTurnoutRailPart";
import CurvedTurnoutRailPart from "components/rails/parts/CurvedTurnoutRailPart";

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

export const RailPartComponentClasses = {
  StraightRail: StraightRailPart,
  CurveRail: CurveRailPart,
  DoubleStraightRail: DoubleStraightRailPart,
  GappedStraightRail: GappedStraightRailPart,
  DoubleCurveRail: DoubleCurveRailPart,
  SimpleTurnout: SimpleTurnoutRailPart,
  WyeTurnout: WyeTurnoutRailPart,
  CurvedTurnout: CurvedTurnoutRailPart,
  ThreeWayTurnout: ThreeWayTurnoutRailPart,
  DoubleCrossTurnout: DoubleCrossTurnoutRailPart,
  EndRail: StraightRailPart,
  CrossingRail: CrossingRailPart
}

export default RailContainerClasses


// TODO: RailProps の方がわかりやすい名前では？
export type RailData = RailBaseProps | StraightRailProps | CurveRailProps | SimpleTurnoutProps | DoubleStraightRailProps | DoubleCrossTurnoutProps


export interface RailGroupData extends RailGroupProps {
  rails: number[]
}

export interface RailItemData {
  type: string
  name: string
  [x: string]: any
}
