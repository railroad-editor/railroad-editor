import reducer, {BUILDER_INITIAL_STATE} from './builder'
import {setActiveLayer} from "actions/builder";


describe('builder reducer', () => {
  it('set active layer', () => {
    //========== When ==========
    let state = reducer(undefined, setActiveLayer(2))

    //========== Then ==========
    expect(state).toEqual({
      ...BUILDER_INITIAL_STATE,
      activeLayerId: 2
    })
  })

  it('add rail group', () => {
    //========== When ==========
    let state = reducer(undefined, setActiveLayer(2))

    //========== Then ==========
    expect(state).toEqual({
      ...BUILDER_INITIAL_STATE,
      activeLayerId: 2
    })
  })

})
