import * as React from "react";
import {compose, defaultProps, mapProps} from "recompose";
import withBuilder from "containers/hoc/withBuilder";
import withRailBase from "containers/rails/withRailBase";
import {RailBase, RailBaseProps} from "react-rail-components";

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
        const position = {x: props.position[1], y: props.position[2]}
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
