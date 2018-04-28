import * as React from "react";
import {compose, defaultProps, mapProps} from "recompose";
import {Point} from "paper";
import withBuilder from "components/hoc/withBuilder";
import withRailBase from "components/rails/withRailBase";
import {RailBase, RailBaseProps} from "components/rails/RailBase";

/**
 * Rail container を生成するためのHOC
 * @param {RailBase<any, any> | any} clazz
 * @returns {React.ComponentClass<TO>}
 */
export function railHocs<TI extends React.Component, TO>(clazz: RailBase<any, any> | any) {
  return compose<TI, TO>(
    defaultProps(clazz.defaultProps),
    mapProps((props: RailBaseProps) => {
      if (props.position instanceof Array) {
        const position = new Point(props.position[1], props.position[2])
        return {
          ...props,
          position
        }
      }
      return props
    }),
    withBuilder,
    withRailBase
  )(clazz)
}
