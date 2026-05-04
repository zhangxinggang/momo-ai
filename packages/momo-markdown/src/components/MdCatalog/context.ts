import { createContext, RefObject } from 'react';

export interface ICatalogContextValue {
  scrollElementRef?: RefObject<HTMLElement | null>;
  rootNodeRef?: RefObject<Document | ShadowRoot | null>;
}

export const CatalogContext = createContext<ICatalogContextValue>({
  scrollElementRef: undefined,
  rootNodeRef: undefined,
});
