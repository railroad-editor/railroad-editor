import * as React from 'react';

interface WithFullscreenInjectedProps {
  fullscreen: boolean
  toggleFullscreen: () => void
}

interface WithFullscreenState {
  fullscreen: boolean
}

export type WithFullscreenProps = WithFullscreenInjectedProps

export default function withFullscreen(WrappedComponent: React.ComponentClass<WithFullscreenProps>) {

  return class extends React.Component<WithFullscreenProps, WithFullscreenState> {

    constructor(props: WithFullscreenProps) {
      super(props)
      this.state = {
        fullscreen: false,
      }
    }

    toggleFullscreen = () => {
      if (! this.state.fullscreen) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        }
      }
    }

    fullScreenChange = () => {
      this.setState({fullscreen: ! this.state.fullscreen})
    }

    componentDidMount() {
      document.addEventListener('webkitfullscreenchange', this.fullScreenChange)
      document.addEventListener('mozfullscreenchange', this.fullScreenChange)
      document.addEventListener('fullscreenchange', this.fullScreenChange)
      document.addEventListener('MSFullscreenChange', this.fullScreenChange)
    }

    componentWillUnmount() {
      document.addEventListener('webkitfullscreenchange', this.fullScreenChange)
      document.addEventListener('mozfullscreenchange', this.fullScreenChange)
      document.addEventListener('fullscreenchange', this.fullScreenChange)
      document.addEventListener('MSFullscreenChange', this.fullScreenChange)
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          fullscreen={this.state.fullscreen}
          toggleFullscreen={this.toggleFullscreen}
        />
      )
    }

  }

}
