import {RailComponentClasses} from "containers/rails/index";
import getLogger from "logging";
import {Point} from "paper";
import * as _ from 'lodash';
import 'lodash.combinations';
import 'lodash.product';
import {CLOSED_JOINT_ANGLE_TOLERANCE, CLOSED_JOINT_DISTANCE_TOLERANCE} from "constants/tools";
import {JointPair} from "useCases";
import RailComponentRegistry from "containers/rails/RailComponentRegistry";
import {RailData} from "stores";

const LOGGER = getLogger(__filename)


/**
 * Point同士を比較し、一致したらtrueを返す
 * @param p1 {Point}
 * @param p2 {Point}
 * @param {number} tolerance 許容誤差
 * @returns {boolean}
 */
export const pointsEqual = (p1: Point, p2: Point, tolerance = 0.0000001) => {
  if (p1 && p2) {
    return (Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance)
  } else if (! p1 && ! p2) {
    return true
  } else {
    return false
  }
}

/**
 * Angle同士を比較し、一致したらtrueを返す
 * @param a1 {number}
 * @param a2 {number}
 * @param {number} tolerance 許容誤差
 * @returns {boolean}
 */
export const anglesEqual = (a1, a2, tolerance = 0.0000001) => {
  const diff = Math.abs((a1 + 360) % 360 - (a2 + 360) % 360)
  return diff < tolerance || 360 - diff < tolerance
}

export const hasOpenJoint = (rail: RailData): boolean => {
  return _.filter(rail.opposingJoints, v => Boolean(v)).length !== RailComponentClasses[rail.type].defaultProps.numJoints
}


/**
 * ２つのレールが重なっているか否かを調べる
 * @param {number} r1
 * @param {number} r2
 * @returns {any}
 */
export const intersectsBetween = (r1: number, r2: number): boolean => {
  let r1Paths = RailComponentRegistry.getRailById(r1).railPart.path.children.filter(p => p.data.type === 'Detect')
  if (r1Paths.length === 0) {
    r1Paths = RailComponentRegistry.getRailById(r1).railPart.path.children
  }
  let r2Paths = RailComponentRegistry.getRailById(r2).railPart.path.children.filter(p => p.data.type === 'Detect')
  if (r2Paths.length === 0) {
    r2Paths = RailComponentRegistry.getRailById(r2).railPart.path.children
  }

  const combinations = _.product(r1Paths, r2Paths)
  const result = combinations.map(cmb => cmb[0].intersects(cmb[1])).some(e => e)
  LOGGER.debug(`Rail intersection of ${r1} and {r2}: ${result}`)
  return result
}

/**
 * targetのレールがrailsのレール群に対して重なっているか否かを調べる
 * @param {number} target
 * @param {number[]} rails
 * @returns {boolean}
 */
export const intersectsOf = (target: number, rails: number[]): boolean => {
  const result = rails.map(rail => intersectsBetween(target, rail)).some(e => e)
  LOGGER.debug(`Rail ${target} intersects.`) //`
  return result
}


/**
 * ２つのレールの近傍にあるジョイントを取得する
 * @param {number} r1
 * @param {number} r2
 * @returns {any[]}
 */
export const getCloseJointsBetween = (r1: number, r2: number): JointPair[] => {
  const r1Joints = RailComponentRegistry.getRailById(r1).joints
  const r2Joints = RailComponentRegistry.getRailById(r2).joints

  const combinations = _.product(r1Joints, r2Joints)
  const closeJointPairs = []
  combinations.forEach(cmb => {
    // 両方が未接続でなければ抜ける
    if ((cmb[0].props.hasOpposingJoint && cmb[1].props.hasOpposingJoint)
      || (! cmb[0].props.visible || ! cmb[1].props.visible)) {
      return
    }
    // if ( ! cmb[0].props.visible || ! cmb[1].props.visible ) {
    //   return
    // }
    // LOGGER.debug(cmb[0].props.data.railId, cmb[0].globalPosition, cmb[0].globalAngle, cmb[1].props.data.railId, cmb[1].globalPosition, cmb[1].globalAngle)
    // ジョイント同士が十分近く、かつ角度が一致していればリストに加える
    const isClose = pointsEqual(cmb[0].globalPosition, cmb[1].globalPosition, CLOSED_JOINT_DISTANCE_TOLERANCE)
    if (! isClose) {
      return
    }
    const isSameAngle = anglesEqual(cmb[0].globalAngle, cmb[1].globalAngle + 180, CLOSED_JOINT_ANGLE_TOLERANCE)
    if (! isSameAngle) {
      return
    }

    closeJointPairs.push({
      from: {
        railId: cmb[0].props.data.railId,
        jointId: cmb[0].props.data.partId
      },
      to: {
        railId: cmb[1].props.data.railId,
        jointId: cmb[1].props.data.partId
      }
    })
  })
  return closeJointPairs
}


/**
 * targetのレールの、railsのレール群に対する近傍ジョイントを取得する
 * @param {number} target
 * @param {RailData[]} rails
 * @returns {any[]}
 */
export const getCloseJointsOf = (target: number, rails: RailData[]): JointPair[] => {
  return _.flatMap(rails, r2 => getCloseJointsBetween(target, r2.id))
}


/**
 * 全てのレール同士の近傍ジョイントを取得する
 * @param {RailData[]} rails
 * @returns {any[]}
 */
export const getAllCloseJoints = (rails: RailData[]): JointPair[] => {
  if (rails.length < 2) {
    return []
  } else {
    const combinations = _.combinations(rails.map(r => r.id), 2)
    return _.flatMap(combinations, cmb => getCloseJointsBetween(cmb[0], cmb[1]))
  }
}


/**
 * 未接続のジョイントを持つレール同士の全ての近傍ジョイントを取得する
 * @param {RailData[]} rails
 * @returns {any[]}
 */
export const getAllOpenCloseJoints = (rails: RailData[]): JointPair[] => {
  const railsWithOpenJoints = rails.filter(r => hasOpenJoint(r))
  if (railsWithOpenJoints.length < 2) {
    return []
  } else {
    const combinations = _.combinations(railsWithOpenJoints.map(r => r.id), 2)
    LOGGER.info(combinations)
    return _.flatMap(combinations, cmb => getCloseJointsBetween(cmb[0], cmb[1]))
  }
}

export const normAngle = (angle: number) => {
  return (angle + 360) % 360
}
