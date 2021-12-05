import { AppInitialProps } from 'next/app';
import { AppContextType } from 'next/dist/shared/lib/utils';
import React from 'react';

declare type JSONSerializable = string | number | boolean | null | JSONSerializable[] | {
    [key: string]: JSONSerializable;
};

declare type PageProps = AppInitialProps['pageProps'];
declare type ActionDataContextProviderProps = {
    pageProps: PageProps;
} & ({
    children: (props: PageProps) => React.ReactElement;
    Component?: AppContextType['Component'];
} | {
    children?: (props: AppInitialProps['pageProps']) => React.ReactElement;
    Component: AppContextType['Component'];
});
declare type ActionDataContextProvider = (props: ActionDataContextProviderProps) => React.ReactElement;
declare const ActionDataContextProvider: ActionDataContextProvider;
declare const useActionData: () => string | number | boolean | JSONSerializable[] | {
    [key: string]: JSONSerializable;
};

declare type FormProps = {
    action?: string;
    children?: React.ReactNode;
    method?: string;
    onError?: (response: Response) => void;
} & React.FormHTMLAttributes<HTMLFormElement>;
declare type Form = (props: FormProps) => React.ReactElement;
declare const Form: Form;

export { ActionDataContextProvider, Form, useActionData };
