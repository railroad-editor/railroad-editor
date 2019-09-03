export const runInSandbox = (function () {

  function extend(dest, src, arr) {
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

  return function runInSandbox(code, globals, base64) {
    let iframe = document.createElement('iframe');
    let callbackFn = null;
    iframe.style.cssText = 'position: absolute; display: none; top: -9999em; left: -9999em; z-index: -1; width: 0px; height: 0px;';
    let script = `,<script>(function () { ${extend('window', globals, null)} ${code} }());</script>`;
    base64 && (script = ';base64,' + window.btoa(script));
    iframe.src = 'data:text/html' + script;

    return {
      execute: function (callback) {
        callbackFn = function (e) {
          callback && callback(e.data);
        };
        window.addEventListener('message', callbackFn);
        document.body.appendChild(iframe);
      },
      destroy: function () {
        window.removeEventListener('message', callbackFn);
        document.body.removeChild(iframe);
        iframe = callbackFn = null;
      },
      postMessage: function (message) {
        iframe.contentWindow.postMessage(message, '*');
      }
    };
  }
}());

