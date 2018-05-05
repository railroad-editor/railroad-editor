import * as React from "react";
import {Route} from "react-router-dom";
import Case01 from "components/cases/Case01_PrimitiveParts";
import Case02 from "components/cases/Case02_PartGroup";
import Case03_1 from "components/cases/Case03_1_PartGroup_update";
import Case03_2 from "components/cases/Case03_2_PartGroup_update";
import Case03_3 from "components/cases/Case03_3_PartGroup_update";
import Case03_4 from "components/cases/Case03_4_PartGroup_update";
import Case04_1 from "components/cases/Case04_1_nested_PartGroup_update";
import Case04_2 from "components/cases/Case04_2_nested_PartGroup_update";
import Case04_3 from "components/cases/Case04_3_nested_PartGroup_update";
import Case04_4 from "components/cases/Case04_4_nested_PartGroup_update";
import Case05_1 from "components/cases/Case05_1_DetectablePart";
import Case05_2 from "components/cases/Case05_2_DetectablePart_update";
import Case06_1 from 'components/cases/Case06_1_RailParts';
import Case06_2 from 'components/cases/Case06_2_RailParts';
import Case07_1 from 'components/cases/Case07_1_RailParts_update';
import Case08_1 from 'components/cases/Case08_1_Rails';
import Case08_2 from 'components/cases/Case08_2_Rails';
import Case09 from "components/cases/Case09_1_RailGroup";

export default class TestCases extends React.Component<any, any> {

  render() {
    return (
      <>
        <Route path="/tests/1" component={Case01}/>
        <Route path="/tests/2" component={Case02}/>
        <Route path="/tests/3_1" component={Case03_1}/>
        <Route path="/tests/3_2" component={Case03_2}/>
        <Route path="/tests/3_3" component={Case03_3}/>
        <Route path="/tests/3_4" component={Case03_4}/>
        <Route path="/tests/4_1" component={Case04_1}/>
        <Route path="/tests/4_2" component={Case04_2}/>
        <Route path="/tests/4_3" component={Case04_3}/>
        <Route path="/tests/4_4" component={Case04_4}/>
        <Route path="/tests/5_1" component={Case05_1}/>
        <Route path="/tests/5_2" component={Case05_2}/>
        <Route path="/tests/6_1" component={Case06_1}/>
        <Route path="/tests/6_2" component={Case06_2}/>
        <Route path="/tests/7_1" component={Case07_1}/>
        <Route path="/tests/8_1" component={Case08_1}/>
        <Route path="/tests/8_2" component={Case08_2}/>
        <Route path="/tests/9" component={Case09}/>
      </>
    )
  }

}