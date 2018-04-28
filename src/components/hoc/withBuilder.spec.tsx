import * as React from 'react'
import {mount} from 'enzyme';
import {configureStore} from "../../store";
import {Provider} from "react-redux";
import {compose} from 'recompose';
import {LAYOUT_STORE_INITIAL_STATE} from "../../reducers/layout";
import {default as withBuilder, WithBuilderPublicProps} from "components/hoc/withBuilder";


class Wrapped extends React.Component<WithBuilderPublicProps, {}> {
  render () { return ( <div></div> ) }
}

const TestComponent = compose(withBuilder)(Wrapped)


const createItem = (id, layerId, name='Test') => {
  return {
    id: id,
    name: name,
    type: 'Test',
    layerId: layerId,
    selected: false
  }
}

describe('withBuilder', () => {

  let wrapper, sut, store

  beforeEach(() => {
    store = configureStore();
    wrapper = mount( <Provider store={store}><TestComponent/></Provider>)
    // 以下のやり方ではstore更新時にpropsが反映されない
    // let wrapper: any = shallow(<TestComponent />, { context: {store} })
    // const wrapper: any = shallow(<TestComponent store={store}/>)
    sut = wrapper.find('WithHistory').instance()
  })


  it('should return the initial state', () => {
    expect(sut.props.layout).toEqual(LAYOUT_STORE_INITIAL_STATE)
    expect(sut.histories).toEqual([LAYOUT_STORE_INITIAL_STATE])
  })

  it('add items', () => {
    const item1 = createItem(1, 1)
    sut.addItem(1, item1)

    expect(sut.props.layout).toEqual({
      layers: [
        {
          id: 1,
          visible: true,
          children: [item1]
        }
      ]
    })

    expect(sut.histories).toEqual([
      LAYOUT_STORE_INITIAL_STATE,
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1]
          }
        ]
      }
    ])

    const item2 = createItem(2, 1)
    sut.addItem(1, item2)

    expect(sut.props.layout).toEqual({
      layers: [
        {
          id: 1,
          visible: true,
          children: [item1, item2]
        }
      ]
    })

    expect(sut.histories).toEqual([
      LAYOUT_STORE_INITIAL_STATE,
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1]
          }
        ]
      },
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1, item2]
          }
        ]

      }
    ])
  })


  it('update items', () => {
    const item1 = createItem(1, 1)
    sut.addItem(1, item1)
    const item2 = createItem(2, 1)
    sut.addItem(1, item2)
    const item3 = createItem(3, 1)
    sut.updateItem(item2, item3)

    expect(sut.props.layout).toEqual({
      layers: [
        {
          id: 1,
          visible: true,
          children: [item1, item3]
        }
      ]
    })

    expect(sut.histories).toEqual([
      LAYOUT_STORE_INITIAL_STATE,
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1]
          }
        ]
      },
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1, item2]
          }
        ]
      },
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1, item3]
          }
        ]

      }
    ])
  })

  it('remove item', () => {
    const item1 = createItem(1, 1)
    sut.addItem(1, item1)
    const item2 = createItem(2, 1)
    sut.addItem(1, item2)
    sut.removeItem(item1)

    expect(sut.props.layout).toEqual({
      layers: [
        {
          id: 1,
          visible: true,
          children: [item2]
        }
      ]
    })

    expect(sut.histories).toEqual([
      LAYOUT_STORE_INITIAL_STATE,
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1]
          }
        ]
      },
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1, item2]
          }
        ]
      },
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item2]
          }
        ]

      }
    ])
  })


  it('undo', () => {
    // ========== Given ==========
    const item1 = createItem(1, 1)
    sut.addItem(1, item1)
    const item2 = createItem(2, 1)
    sut.addItem(1, item2)

    // ========== When ==========
    sut.undo()

    // ========== Then ========== レイアウトが一つ前のヒストリに変更される
    expect(sut.props.layout).toEqual({
      layers: [
        {
          id: 1,
          visible: true,
          children: [item1]
        }
      ]
    })

    const expectedHistories = [
      LAYOUT_STORE_INITIAL_STATE,
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1]
          }
        ]
      },
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1, item2]
          }
        ]
      }
    ]
    expect(sut.histories).toEqual(expectedHistories)
    expect(sut.historyIndex).toEqual(1)

    // ========== When ==========
    sut.undo()

    // ========== Then ========== レイアウトが一つ前のヒストリに変更される
    expect(sut.histories).toEqual(expectedHistories)
    expect(sut.historyIndex).toEqual(0)

    // ========== When ==========
    sut.undo()

    // ========== Then ========== すでに一番古いヒストリの場合は変更されない
    expect(sut.props.layout).toEqual({
      layers: [
        {
          id: 1,
          visible: true,
          children: []
        }
      ]
    })
    expect(sut.histories).toEqual(expectedHistories)
    expect(sut.historyIndex).toEqual(0)

    // ========== When ==========
    const item3 = createItem(3, 1)
    sut.addItem(1, item3)

    // ========== Then ========== アイテムが追加・更新された時は、現在参照しているヒストリの後に追加される
    expect(sut.props.layout).toEqual({
      layers: [
        {
          id: 1,
          visible: true,
          children: [item3]
        }
      ]
    })
    expect(sut.histories).toEqual([
      LAYOUT_STORE_INITIAL_STATE,
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item3]
          }
        ]
      }
    ])
    expect(sut.historyIndex).toEqual(1)
  })


  it('redo', () => {
    // ========== Given ==========
    const item1 = createItem(1, 1)
    sut.addItem(1, item1)
    const item2 = createItem(2, 1)
    sut.addItem(1, item2)

    sut.undo()

    // ========== When ==========
    sut.redo()

    // ========== Then ========== レイアウトが一つ後のヒストリに変更される
    const expectedLayout = {
      layers: [
        {
          id: 1,
          visible: true,
          children: [item1, item2]
        }
      ]

    }
    expect(sut.props.layout).toEqual(expectedLayout)

    const expectedHistories = [
      LAYOUT_STORE_INITIAL_STATE,
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1]
          }
        ]
      },
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1, item2]
          }
        ]
      }
    ]
    expect(sut.histories).toEqual(expectedHistories)
    expect(sut.historyIndex).toEqual(2)

    sut.redo()

    expect(sut.props.layout).toEqual(expectedLayout)
    expect(sut.histories).toEqual(expectedHistories)
    expect(sut.historyIndex).toEqual(2)
  })


  it('clearHistory', () => {
    const item1 = createItem(1, 1)
    sut.addItem(1, item1)
    const item2 = createItem(2, 1)
    sut.addItem(1, item2)

    sut.clearHistory()

    const expectedLayout = {
      layers: [
        {
          id: 1,
          visible: true,
          children: [item1, item2]
        }
      ]

    }
    expect(sut.props.layout).toEqual(expectedLayout)
    expect(sut.histories).toEqual([
      {
        layers: [
          {
            id: 1,
            visible: true,
            children: [item1, item2]
          }
        ]
      }
    ])
    expect(sut.historyIndex).toEqual(0)
  })
})
