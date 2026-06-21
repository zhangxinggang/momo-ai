import { RefObject } from 'react';
export interface ICatalogContextValue {
    scrollElementRef?: RefObject<HTMLElement | null>;
    rootNodeRef?: RefObject<Document | ShadowRoot | null>;
}
export declare const CatalogContext: import("react").Context<ICatalogContextValue>;
