import React from 'react';
import { useRouter } from 'next/router';

const ActionDataContext = React.createContext([{}, () => {
}]);
const ActionDataContextProvider = ({
  Component,
  children: childrenProp,
  pageProps: { __ACTION_DATA__, ...pageProps }
}) => {
  const [value, setValue] = React.useState(__ACTION_DATA__ ?? {});
  const children = Component ? (props) => /* @__PURE__ */ React.createElement(Component, {
    ...props
  }) : childrenProp;
  return /* @__PURE__ */ React.createElement(ActionDataContext.Provider, {
    value: [value, setValue]
  }, children?.(pageProps));
};
const _useActionDataSetter = () => React.useContext(ActionDataContext);
const useActionData = () => React.useContext(ActionDataContext)?.[0] ?? {};

const Form = ({
  action,
  children,
  method: methodProp = "POST",
  onError,
  ...props
}) => {
  const router = useRouter();
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
      router.push((await response.json()).__REDIRECT_LOCATION__);
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
  return /* @__PURE__ */ React.createElement("form", {
    method,
    onSubmit,
    encType: "multipart/form-data",
    ...props
  }, children);
};

export { ActionDataContextProvider, Form, useActionData };
//# sourceMappingURL=index.mjs.map
