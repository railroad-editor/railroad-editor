import reducer from './tools'
import {setTool} from "../actions/tools";

describe('todos reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual({
        activeTool: "Straight Rails"
      }
    )
  })

  it('should return the initial state', () => {
    const action = setTool("Curve Rails")
    expect(reducer(undefined, action)).toEqual({
        activeTool: "Curve Rails"
      }
    )
  })
})
