import * as React from 'react'
import ProductHero from "./ProductHero/ProductHero";
import ProductValues from "./ProductValue/ProductValues";


export default class Home extends React.Component<{}, {}> {

  render() {
    return (
      <>
        <ProductHero/>
        <ProductValues/>
      </>
    )
  }
}
