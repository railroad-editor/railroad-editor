import reducer, {LayerData} from './layout'
import {
  addLayer,
  addRail,
  addRailGroup,
  deleteLayer,
  deleteRailGroup,
  removeRail,
  updateLayer,
  updateRail
} from "actions/layout";
// import {Point} from "paper";
import {RailData, RailGroupData} from "components/rails";

const createRailGroup = (id, layerId, childIds): RailGroupData => {
  return {
    id: id,
    position: {x:0, y:0} as any,
    angle: 0,
    name: 'hoge',
    type: 'test',
    rails: childIds,
    pivotJointInfo: null
  }
}

const createRail = (id, layerId, groupId=1): RailData => {
  return {
    id: id,
    position: {x:0, y:0} as any,
    angle: 0,
    name: 'hoge',
    type: 'test',
    layerId: layerId,
    selected: false,
    opposingJoints: {},
    length: 10,
    groupId: groupId
  }
}

const createLayer = (id, name): LayerData => {
  return {
    id: id,
    name: name,
    visible: true,
    color: '#000',
  }
}

describe('layout reducer', () => {
  it('adds a rail of the layout', () => {
    //========== When ========== 1個目のアイテムを追加
    let item = createRail(1, 1)
    let item2 = createRail(2, 1)
    let state = reducer(undefined, addRail({
      item: item,
    }))
    state = reducer(state, addRail({
      item: item2
    }))

    //========== Then ==========
    expect(state).toEqual({
        histories: [
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [],
            railGroups: [],
          },
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [item],
            railGroups: [],
          },
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [item, item2],
            railGroups: [],
          },
        ],
        historyIndex: 2,
        meta: null
      }
    )
  })

  it('updates a rail of the layout', () => {
    //========== Given ==========
    let item = createRail(1, 1)
    let item2 = createRail(2, 1)
    let state = reducer(undefined, addRail({
      item: item,
    }))
    state = reducer(state, addRail({
      item: item2
    }))

    //========== When ========== 1個目のアイテムを変更
    let item3 = createRail(1, 2)
    state = reducer(state, updateRail({
      item: item3
    }))

    //========== Then ==========
    expect(state).toEqual({
        histories: [
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [],
            railGroups: [],
          },
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [item],
            railGroups: [],
          },
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [item, item2],
            railGroups: [],
          },
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [item3, item2],
            railGroups: [],
          }
        ],
        historyIndex: 3,
        meta: null
      }
    )
  })


  it('deletes a rail of the layout', () => {
      //========== Given ==========
      let child1 = createRail(1, 1)
      let child2 = createRail(2, 1)
      let group1 = createRailGroup(1, 1, [1, 2])
      let child3 = createRail(3, 1, 2)

      let state = reducer(undefined, addRailGroup({
        item: group1,
        children: [child1, child2]
      }))
      state = reducer(state, addRail({
        item: child3,
      }))

      //========== When ========== 3個目のレールを削除
      state = reducer(state, removeRail({
        item: {id: 3}
      }))

      //========== Then ==========
      expect(state).toEqual({
          histories: [
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [],
              railGroups: [],
            },
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [child1, child2],
              railGroups: [group1],
            },
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [child1, child2, child3],
              railGroups: [group1],
            },
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [child1, child2],
              railGroups: [group1],
            },
          ],
          historyIndex: 3,
          meta: null
        }
      )

      //========== When ========== 1個目のアイテムを削除
      state = reducer(state, removeRail({
        item: {id: 2}
      }))

      let group2 = createRailGroup(1, 1, [1])

      // //========== Then ==========
      expect(state).toEqual({
          histories: [
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [],
              railGroups: [],
            },
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [child1, child2],
              railGroups: [group1],
            },
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [child1, child2, child3],
              railGroups: [group1],
            },
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [child1, child2],
              railGroups: [group1],
            },
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [child1],
              railGroups: [group2],
            },
          ],
          historyIndex: 4,
          meta: null
        }
      )
    }
  )

  it('adds a rail group of the layout', () => {
    //========== When ========== 1個目のアイテムを追加
    let child1 = createRail(1, 1)
    let child2 = createRail(2, 1)
    let group1 = createRailGroup(1, 1, [1, 2])

    let state = reducer(undefined, addRailGroup({
      item: group1,
      children: [child1, child2]
    }))

    //========== Then ==========
    expect(state).toEqual({
        histories: [
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [],
            railGroups: [],
          },
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [child1, child2],
            railGroups: [group1],
          },
        ],
        historyIndex: 1,
        meta: null
      }
    )
  })

  it('delete a rail group of the layout', () => {
    //========== Given ==========
    let child1 = createRail(1, 1)
    let child2 = createRail(2, 1)
    let group1 = createRailGroup(1, 1, [1, 2])
    let child3 = createRail(3, 1, 2)
    let group2 = createRailGroup(2, 1, [3])

    let state = reducer(undefined, addRailGroup({
      item: group1,
      children: [child1, child2]
    }))
    state = reducer(state, addRailGroup({
      item: group2,
      children: [child3]
    }))

    //========== When ========== 1個目のレールグループを削除
    state = reducer(state, deleteRailGroup({
      item: {id: 1}
    }))

    //========== Then ==========
    expect(state).toEqual({
        histories: [
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [],
            railGroups: [],
          },
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [child1, child2],
            railGroups: [group1],
          },
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [child1, child2, child3],
            railGroups: [group1, group2],
          },
          {
            layers: [{id: 1, name: 'Layer 1', visible: true}],
            rails: [child3],
            railGroups: [group2],
          },
        ],
        historyIndex: 3,
        meta: null
      }
    )
  })

  it('adds, updates, removes a rail of the layout without adding histories', () => {
      //========== When ========== 1個目のアイテムを追加
      let item = createRail(1, 1)
      let item2 = createRail(2, 1)
      let state = reducer(undefined, addRail({
        item: item,
        overwrite: true
      }))
      state = reducer(state, addRail({
        item: item2,
        overwrite: true
      }))

      //========== Then ==========
      expect(state).toEqual({
          histories: [
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [item, item2]
            },
          ],
          historyIndex: 0,
          name: 'Untitled'
        }
      )

      //========== When ========== 1個目のアイテムを更新
      let item3 = createRail(1, 2)
      state = reducer(state, updateRail({
        item: item3,
        overwrite: true
      }))

      //========== Then ==========
      expect(state).toEqual({
          histories: [
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [item3, item2]
            },
          ],
          historyIndex: 0,
          name: 'Untitled'
        }
      )

      //========== When ========== 1個目のアイテムを削除
      state = reducer(state, removeRail({
        item: item3,
        overwrite: true
      }))

      //========== Then ==========
      expect(state).toEqual({
          histories: [
            {
              layers: [{id: 1, name: 'Layer 1', visible: true}],
              rails: [item2]
            }
          ],
          historyIndex: 0,
          name: 'Untitled'
        }
      )
    }
  )


  it('adds, updates, removes a layer of the layout', () => {
      //========== When ========== 1個目のアイテムを追加
      let item = createLayer(2, 'Layer 2')
      let state = reducer(undefined, addLayer({
        item: item,
      }))

      //========== Then ==========
      expect(state).toEqual({
          histories: [
            {
              layers: [
                {id: 1, name: 'Layer 1', visible: true}
              ],
              rails: []
            },
            {
              layers: [
                {id: 1, name: 'Layer 1', visible: true},
                {id: 2, name: 'Layer 2', visible: true},
              ],
              rails: []
            },
          ],
          historyIndex: 1,
          name: 'Untitled'
        }
      )

      //========== When ========== 1個目のアイテムを更新
      let item3 = createLayer(1, 'Layer first')
      state = reducer(state, updateLayer({
        item: item3
      }))

      //========== Then ==========
      expect(state).toEqual({
          histories: [
            {
              layers: [
                {id: 1, name: 'Layer 1', visible: true}
              ],
              rails: []
            },
            {
              layers: [
                {id: 1, name: 'Layer 1', visible: true},
                {id: 2, name: 'Layer 2', visible: true},
              ],
              rails: []
            },
            {
              layers: [
                {id: 1, name: 'Layer first', visible: true},
                {id: 2, name: 'Layer 2', visible: true},
              ],
              rails: []
            },
          ],
          historyIndex: 2,
          name: 'Untitled'
        }
      )

      //========== When ========== 1個目のアイテムを削除
      state = reducer(state, deleteLayer({
        id: item3.id,
      }))
      //========== Then ==========
      expect(state).toEqual({
          histories: [
            {
              layers: [
                {id: 1, name: 'Layer 1', visible: true}
              ],
              rails: []
            },
            {
              layers: [
                {id: 1, name: 'Layer 1', visible: true},
                {id: 2, name: 'Layer 2', visible: true},
              ],
              rails: []
            },
            {
              layers: [
                {id: 1, name: 'Layer first', visible: true},
                {id: 2, name: 'Layer 2', visible: true},
              ],
              rails: []
            },
            {
              layers: [
                {id: 2, name: 'Layer 2', visible: true},
              ],
              rails: []
            },
          ],
          historyIndex: 3,
          name: 'Untitled'
        }
      )
    }
  )
})
