'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var router = require('next/router');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const ActionDataContext = React__default["default"].createContext([{}, () => {
}]);
const ActionDataContextProvider = ({
  Component,
  children: childrenProp,
  pageProps: { __ACTION_DATA__, ...pageProps }
}) => {
  const [value, setValue] = React__default["default"].useState(__ACTION_DATA__ ?? {});
  const children = Component ? (props) => /* @__PURE__ */ React__default["default"].createElement(Component, {
    ...props
  }) : childrenProp;
  return /* @__PURE__ */ React__default["default"].createElement(ActionDataContext.Provider, {
    value: [value, setValue]
  }, children?.(pageProps));
};
const _useActionDataSetter = () => React__default["default"].useContext(ActionDataContext);
const useActionData = () => React__default["default"].useContext(ActionDataContext)?.[0] ?? {};

const Form = ({
  action,
  children,
  method: methodProp = "POST",
  onError,
  ...props
}) => {
  const router$1 = router.useRouter();
  const [, setActionData] = _useActionDataSetter();
  const method = methodProp.toUpperCase();
  const onSubmit = async (event) => {
    event.preventDefault();
    const actionUrl = action ?? document.location.pathname;
    const response = await fetch(new Request(actionUrl, {
      body: new FormData(event.target),
      headers: { "x-fetch": "true" },
      method
    }));
    if ([307, 308].includes(response.status)) {
      router$1.push((await response.json()).__REDIRECT_LOCATION__);
      return;
    }
    if (response.ok) {
      setActionData((await response.json()).__ACTION_DATA__);
      return;
    }
    if (onError) {
      onError(response);
    } else {
      throw new Error(response.statusText);
    }
  };
  return /* @__PURE__ */ React__default["default"].createElement("form", {
    method,
    onSubmit,
    encType: "multipart/form-data",
    ...props
  }, children);
};

exports.ActionDataContextProvider = ActionDataContextProvider;
exports.Form = Form;
exports.useActionData = useActionData;
//# sourceMappingURL=index.js.map
