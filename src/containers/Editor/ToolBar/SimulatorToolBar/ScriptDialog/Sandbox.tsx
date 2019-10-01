import * as React from "react";
import {forwardRef, useEffect, useImperativeHandle, useRef} from "react";


function extend(dest: string, src: Object, arr: boolean = false): string {
  let property = null,
    ext = '',
    isArray = false,
    key;
  for (property in src) {
    key = arr ? '[' + property + ']' : '["' + property + '"]';
    ext += dest + key + ' = ';
    if (typeof src[property] === 'object' && src[property] !== null) {
      isArray = Object.prototype.toString.call(src[property]) === '[object Array]';
      ext += dest + key + (isArray ? ' || [];' : ' || {};');
      ext += extend(dest + key, src[property], isArray);
    } else if (typeof src[property] === 'function') {
      ext += src[property].toString() + ';';
    } else if (typeof src[property] === 'string') {
      ext += '"' + src[property] + '";';
    } else {
      ext += src[property] + ';';
    }
  }
  return ext;
}


export interface SandboxProps {
  code: string
  globals?: object
  onMessage?: (e: MessageEvent) => void
}


export const Sandbox = forwardRef((props: SandboxProps, ref: any) => {

  const iframeRef = useRef<HTMLIFrameElement>()
  useImperativeHandle(ref, () => {
    return {
      postMessage(message: any) {
        iframeRef.current.contentWindow.postMessage(message, '*');
      }
    }
  })
  useEffect(() => {
    window.addEventListener('message', props.onMessage)
    return () => {
      window.removeEventListener('message', props.onMessage);
    }
  }, [])

  const globals = props.globals ? props.globals : {}
  let script = `data:text/html,<script>(function () { ${extend('window', globals)} ${props.code} }());</script>`;

  return (
    <iframe
      title={'sandbox'}
      ref={iframeRef}
      src={script}
      style={{
        width: '0px',
        height: '0px'
      }}
    >
    </iframe>
  )
})

// constructor(code: string, globals: Object, callback: (ev: MessageEvent) => void) {
//   let iframe = document.createElement('iframe');
//   iframe.style.cssText = 'position: absolute; display: none; top: -9999em; left: -9999em; z-index: -1; width:' +
//     ' 0px; height: 0px;';
//   this.iframe = iframe
//   this.callback = callback
// }

