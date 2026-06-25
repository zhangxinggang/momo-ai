import { ForwardedRef, MutableRefObject } from 'react';
import { IContentExposeParam } from './layouts/Content/type';
import {
  IEditorProps,
  IInnerError,
  IMdPreviewProps,
  ISettingType,
  IStaticProps,
  IStaticTextDefaultValue,
  TUpdateSetting,
} from './type';
/**
 * 键盘监听
 *
 * @param props
 * @param staticProps
 */
export declare const useOnSave: (props: IEditorProps, staticProps: IStaticProps) => void;
/**
 * 插入编辑器支持的扩展外链
 *
 * @param staticProps
 */
export declare const useExpansion: (staticProps: IStaticProps) => void;
export declare const useExpansionPreview: () => void;
/**
 *  错误监听
 *
 * @param editorId
 * @param onError
 */
export declare const useErrorCatcher: (
  editorId: string,
  onError: (err: IInnerError) => void,
) => void;
/**
 * 上传图片事件
 * @param props
 * @param staticProps
 */
export declare const useUploadImg: (props: IEditorProps, staticProps: IStaticProps) => void;
/**
 * 内部目录状态
 *
 * @param props
 * @param staticProps
 * @returns
 */
export declare const useCatalog: (_props: IEditorProps, staticProps: IStaticProps) => boolean;
export declare const useMdPreviewConfig: (props: IMdPreviewProps) => readonly [
  {
    js: {
      async?: boolean | undefined;
      blocking?: DOMTokenList | undefined;
      charset?: string | undefined;
      crossOrigin?: string | null | undefined;
      defer?: boolean | undefined;
      event?: string | undefined;
      fetchPriority?: 'auto' | 'high' | 'low' | undefined;
      htmlFor?: string | undefined;
      integrity?: string | undefined;
      noModule?: boolean | undefined;
      referrerPolicy?: string | undefined;
      src: string | undefined;
      text?: string | undefined;
      type?: string | undefined;
      addEventListener?:
        | {
            <K extends keyof HTMLElementEventMap>(
              type: K,
              listener: (this: HTMLScriptElement, ev: HTMLElementEventMap[K]) => any,
              options?: boolean | AddEventListenerOptions,
            ): void;
            (
              type: string,
              listener: EventListenerOrEventListenerObject,
              options?: boolean | AddEventListenerOptions,
            ): void;
          }
        | undefined;
      removeEventListener?:
        | {
            <K extends keyof HTMLElementEventMap>(
              type: K,
              listener: (this: HTMLScriptElement, ev: HTMLElementEventMap[K]) => any,
              options?: boolean | EventListenerOptions,
            ): void;
            (
              type: string,
              listener: EventListenerOrEventListenerObject,
              options?: boolean | EventListenerOptions,
            ): void;
          }
        | undefined;
      accessKey?: string | undefined;
      accessKeyLabel?: string | undefined;
      autocapitalize?: string | undefined;
      autocorrect?: boolean | undefined;
      dir?: string | undefined;
      draggable?: boolean | undefined;
      hidden?: boolean | 'until-found' | undefined;
      inert?: boolean | undefined;
      innerText?: string | undefined;
      lang?: string | undefined;
      offsetHeight?: number | undefined;
      offsetLeft?: number | undefined;
      offsetParent?: Element | null | undefined;
      offsetTop?: number | undefined;
      offsetWidth?: number | undefined;
      outerText?: string | undefined;
      popover?: string | null | undefined;
      spellcheck?: boolean | undefined;
      title?: string | undefined;
      translate?: boolean | undefined;
      writingSuggestions?: string | undefined;
      attachInternals?: (() => ElementInternals) | undefined;
      click?: (() => void) | undefined;
      hidePopover?: (() => void) | undefined;
      showPopover?: ((options?: ShowPopoverOptions) => void) | undefined;
      togglePopover?: ((options?: TogglePopoverOptions | boolean) => boolean) | undefined;
      attributes?: NamedNodeMap | undefined;
      classList?: DOMTokenList | undefined;
      className?: string | undefined;
      clientHeight?: number | undefined;
      clientLeft?: number | undefined;
      clientTop?: number | undefined;
      clientWidth?: number | undefined;
      currentCSSZoom?: number | undefined;
      customElementRegistry?: CustomElementRegistry | null | undefined;
      id?: string | undefined;
      innerHTML?: string | undefined;
      localName?: string | undefined;
      namespaceURI?: string | null | undefined;
      onfullscreenchange?: ((this: Element, ev: Event) => any) | null | undefined;
      onfullscreenerror?: ((this: Element, ev: Event) => any) | null | undefined;
      outerHTML?: string | undefined;
      ownerDocument?: Document | undefined;
      part?: DOMTokenList | undefined;
      prefix?: string | null | undefined;
      scrollHeight?: number | undefined;
      scrollLeft?: number | undefined;
      scrollTop?: number | undefined;
      scrollWidth?: number | undefined;
      shadowRoot?: ShadowRoot | null | undefined;
      slot?: string | undefined;
      tagName?: string | undefined;
      attachShadow?: ((init: ShadowRootInit) => ShadowRoot) | undefined;
      checkVisibility?: ((options?: CheckVisibilityOptions) => boolean) | undefined;
      closest?:
        | {
            <K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
            <K extends keyof SVGElementTagNameMap>(selector: K): SVGElementTagNameMap[K] | null;
            <K extends keyof MathMLElementTagNameMap>(
              selector: K,
            ): MathMLElementTagNameMap[K] | null;
            <E extends Element = Element>(selectors: string): E | null;
          }
        | undefined;
      computedStyleMap?: (() => StylePropertyMapReadOnly) | undefined;
      getAttribute?: ((qualifiedName: string) => string | null) | undefined;
      getAttributeNS?: ((namespace: string | null, localName: string) => string | null) | undefined;
      getAttributeNames?: (() => string[]) | undefined;
      getAttributeNode?: ((qualifiedName: string) => Attr | null) | undefined;
      getAttributeNodeNS?:
        | ((namespace: string | null, localName: string) => Attr | null)
        | undefined;
      getBoundingClientRect?: (() => DOMRect) | undefined;
      getClientRects?: (() => DOMRectList) | undefined;
      getElementsByClassName?: ((classNames: string) => HTMLCollectionOf<Element>) | undefined;
      getElementsByTagName?:
        | {
            <K extends keyof HTMLElementTagNameMap>(
              qualifiedName: K,
            ): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
            <K extends keyof SVGElementTagNameMap>(
              qualifiedName: K,
            ): HTMLCollectionOf<SVGElementTagNameMap[K]>;
            <K extends keyof MathMLElementTagNameMap>(
              qualifiedName: K,
            ): HTMLCollectionOf<MathMLElementTagNameMap[K]>;
            <K extends keyof HTMLElementDeprecatedTagNameMap>(
              qualifiedName: K,
            ): HTMLCollectionOf<HTMLElementDeprecatedTagNameMap[K]>;
            (qualifiedName: string): HTMLCollectionOf<Element>;
          }
        | undefined;
      getElementsByTagNameNS?:
        | {
            (
              namespaceURI: 'http://www.w3.org/1999/xhtml',
              localName: string,
            ): HTMLCollectionOf<HTMLElement>;
            (
              namespaceURI: 'http://www.w3.org/2000/svg',
              localName: string,
            ): HTMLCollectionOf<SVGElement>;
            (
              namespaceURI: 'http://www.w3.org/1998/Math/MathML',
              localName: string,
            ): HTMLCollectionOf<MathMLElement>;
            (namespace: string | null, localName: string): HTMLCollectionOf<Element>;
          }
        | undefined;
      getHTML?: ((options?: GetHTMLOptions) => string) | undefined;
      hasAttribute?: ((qualifiedName: string) => boolean) | undefined;
      hasAttributeNS?: ((namespace: string | null, localName: string) => boolean) | undefined;
      hasAttributes?: (() => boolean) | undefined;
      hasPointerCapture?: ((pointerId: number) => boolean) | undefined;
      insertAdjacentElement?:
        | ((where: InsertPosition, element: Element) => Element | null)
        | undefined;
      insertAdjacentHTML?: ((position: InsertPosition, string: string) => void) | undefined;
      insertAdjacentText?: ((where: InsertPosition, data: string) => void) | undefined;
      matches?:
        | {
            <K extends keyof HTMLElementTagNameMap>(selectors: K): this is HTMLElementTagNameMap[K];
            <K extends keyof SVGElementTagNameMap>(selectors: K): this is SVGElementTagNameMap[K];
            <K extends keyof MathMLElementTagNameMap>(
              selectors: K,
            ): this is MathMLElementTagNameMap[K];
            (selectors: string): boolean;
          }
        | undefined;
      releasePointerCapture?: ((pointerId: number) => void) | undefined;
      removeAttribute?: ((qualifiedName: string) => void) | undefined;
      removeAttributeNS?: ((namespace: string | null, localName: string) => void) | undefined;
      removeAttributeNode?: ((attr: Attr) => Attr) | undefined;
      requestFullscreen?: ((options?: FullscreenOptions) => Promise<void>) | undefined;
      requestPointerLock?: ((options?: PointerLockOptions) => Promise<void>) | undefined;
      scroll?:
        | {
            (options?: ScrollToOptions): void;
            (x: number, y: number): void;
          }
        | undefined;
      scrollBy?:
        | {
            (options?: ScrollToOptions): void;
            (x: number, y: number): void;
          }
        | undefined;
      scrollIntoView?: ((arg?: boolean | ScrollIntoViewOptions) => void) | undefined;
      scrollTo?:
        | {
            (options?: ScrollToOptions): void;
            (x: number, y: number): void;
          }
        | undefined;
      setAttribute?: ((qualifiedName: string, value: string) => void) | undefined;
      setAttributeNS?:
        | ((namespace: string | null, qualifiedName: string, value: string) => void)
        | undefined;
      setAttributeNode?: ((attr: Attr) => Attr | null) | undefined;
      setAttributeNodeNS?: ((attr: Attr) => Attr | null) | undefined;
      setHTMLUnsafe?: ((html: string) => void) | undefined;
      setPointerCapture?: ((pointerId: number) => void) | undefined;
      toggleAttribute?: ((qualifiedName: string, force?: boolean) => boolean) | undefined;
      webkitMatchesSelector?: ((selectors: string) => boolean) | undefined;
      textContent?: string | undefined;
      baseURI?: string | undefined;
      childNodes?: NodeListOf<ChildNode> | undefined;
      firstChild?: ChildNode | null | undefined;
      isConnected?: boolean | undefined;
      lastChild?: ChildNode | null | undefined;
      nextSibling?: ChildNode | null | undefined;
      nodeName?: string | undefined;
      nodeType?: number | undefined;
      nodeValue?: string | null | undefined;
      parentElement?: HTMLElement | null | undefined;
      parentNode?: ParentNode | null | undefined;
      previousSibling?: ChildNode | null | undefined;
      appendChild?: (<T extends Node>(node: T) => T) | undefined;
      cloneNode?: ((subtree?: boolean) => Node) | undefined;
      compareDocumentPosition?: ((other: Node) => number) | undefined;
      contains?: ((other: Node | null) => boolean) | undefined;
      getRootNode?: ((options?: GetRootNodeOptions) => Node) | undefined;
      hasChildNodes?: (() => boolean) | undefined;
      insertBefore?: (<T extends Node>(node: T, child: Node | null) => T) | undefined;
      isDefaultNamespace?: ((namespace: string | null) => boolean) | undefined;
      isEqualNode?: ((otherNode: Node | null) => boolean) | undefined;
      isSameNode?: ((otherNode: Node | null) => boolean) | undefined;
      lookupNamespaceURI?: ((prefix: string | null) => string | null) | undefined;
      lookupPrefix?: ((namespace: string | null) => string | null) | undefined;
      normalize?: (() => void) | undefined;
      removeChild?: (<T extends Node>(child: T) => T) | undefined;
      replaceChild?: (<T extends Node>(node: Node, child: T) => T) | undefined;
      ELEMENT_NODE?: 1 | undefined;
      ATTRIBUTE_NODE?: 2 | undefined;
      TEXT_NODE?: 3 | undefined;
      CDATA_SECTION_NODE?: 4 | undefined;
      ENTITY_REFERENCE_NODE?: 5 | undefined;
      ENTITY_NODE?: 6 | undefined;
      PROCESSING_INSTRUCTION_NODE?: 7 | undefined;
      COMMENT_NODE?: 8 | undefined;
      DOCUMENT_NODE?: 9 | undefined;
      DOCUMENT_TYPE_NODE?: 10 | undefined;
      DOCUMENT_FRAGMENT_NODE?: 11 | undefined;
      NOTATION_NODE?: 12 | undefined;
      DOCUMENT_POSITION_DISCONNECTED?: 1 | undefined;
      DOCUMENT_POSITION_PRECEDING?: 2 | undefined;
      DOCUMENT_POSITION_FOLLOWING?: 4 | undefined;
      DOCUMENT_POSITION_CONTAINS?: 8 | undefined;
      DOCUMENT_POSITION_CONTAINED_BY?: 16 | undefined;
      DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC?: 32 | undefined;
      dispatchEvent?: ((event: Event) => boolean) | undefined;
      ariaActiveDescendantElement?: Element | null | undefined;
      ariaAtomic?: string | null | undefined;
      ariaAutoComplete?: string | null | undefined;
      ariaBrailleLabel?: string | null | undefined;
      ariaBrailleRoleDescription?: string | null | undefined;
      ariaBusy?: string | null | undefined;
      ariaChecked?: string | null | undefined;
      ariaColCount?: string | null | undefined;
      ariaColIndex?: string | null | undefined;
      ariaColIndexText?: string | null | undefined;
      ariaColSpan?: string | null | undefined;
      ariaControlsElements?: readonly Element[] | null | undefined;
      ariaCurrent?: string | null | undefined;
      ariaDescribedByElements?: readonly Element[] | null | undefined;
      ariaDescription?: string | null | undefined;
      ariaDetailsElements?: readonly Element[] | null | undefined;
      ariaDisabled?: string | null | undefined;
      ariaErrorMessageElements?: readonly Element[] | null | undefined;
      ariaExpanded?: string | null | undefined;
      ariaFlowToElements?: readonly Element[] | null | undefined;
      ariaHasPopup?: string | null | undefined;
      ariaHidden?: string | null | undefined;
      ariaInvalid?: string | null | undefined;
      ariaKeyShortcuts?: string | null | undefined;
      ariaLabel?: string | null | undefined;
      ariaLabelledByElements?: readonly Element[] | null | undefined;
      ariaLevel?: string | null | undefined;
      ariaLive?: string | null | undefined;
      ariaModal?: string | null | undefined;
      ariaMultiLine?: string | null | undefined;
      ariaMultiSelectable?: string | null | undefined;
      ariaOrientation?: string | null | undefined;
      ariaOwnsElements?: readonly Element[] | null | undefined;
      ariaPlaceholder?: string | null | undefined;
      ariaPosInSet?: string | null | undefined;
      ariaPressed?: string | null | undefined;
      ariaReadOnly?: string | null | undefined;
      ariaRelevant?: string | null | undefined;
      ariaRequired?: string | null | undefined;
      ariaRoleDescription?: string | null | undefined;
      ariaRowCount?: string | null | undefined;
      ariaRowIndex?: string | null | undefined;
      ariaRowIndexText?: string | null | undefined;
      ariaRowSpan?: string | null | undefined;
      ariaSelected?: string | null | undefined;
      ariaSetSize?: string | null | undefined;
      ariaSort?: string | null | undefined;
      ariaValueMax?: string | null | undefined;
      ariaValueMin?: string | null | undefined;
      ariaValueNow?: string | null | undefined;
      ariaValueText?: string | null | undefined;
      role?: string | null | undefined;
      animate?:
        | ((
            keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
            options?: number | KeyframeAnimationOptions,
          ) => Animation)
        | undefined;
      getAnimations?: ((options?: GetAnimationsOptions) => Animation[]) | undefined;
      after?: ((...nodes: (Node | string)[]) => void) | undefined;
      before?: ((...nodes: (Node | string)[]) => void) | undefined;
      remove?: (() => void) | undefined;
      replaceWith?: ((...nodes: (Node | string)[]) => void) | undefined;
      nextElementSibling?: Element | null | undefined;
      previousElementSibling?: Element | null | undefined;
      childElementCount?: number | undefined;
      children?: HTMLCollection | undefined;
      firstElementChild?: Element | null | undefined;
      lastElementChild?: Element | null | undefined;
      append?: ((...nodes: (Node | string)[]) => void) | undefined;
      moveBefore?: ((node: Node, child: Node | null) => void) | undefined;
      prepend?: ((...nodes: (Node | string)[]) => void) | undefined;
      querySelector?:
        | {
            <K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
            <K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
            <K extends keyof MathMLElementTagNameMap>(
              selectors: K,
            ): MathMLElementTagNameMap[K] | null;
            <K extends keyof HTMLElementDeprecatedTagNameMap>(
              selectors: K,
            ): HTMLElementDeprecatedTagNameMap[K] | null;
            <E extends Element = Element>(selectors: string): E | null;
          }
        | undefined;
      querySelectorAll?:
        | {
            <K extends keyof HTMLElementTagNameMap>(
              selectors: K,
            ): NodeListOf<HTMLElementTagNameMap[K]>;
            <K extends keyof SVGElementTagNameMap>(
              selectors: K,
            ): NodeListOf<SVGElementTagNameMap[K]>;
            <K extends keyof MathMLElementTagNameMap>(
              selectors: K,
            ): NodeListOf<MathMLElementTagNameMap[K]>;
            <K extends keyof HTMLElementDeprecatedTagNameMap>(
              selectors: K,
            ): NodeListOf<HTMLElementDeprecatedTagNameMap[K]>;
            <E extends Element = Element>(selectors: string): NodeListOf<E>;
          }
        | undefined;
      replaceChildren?: ((...nodes: (Node | string)[]) => void) | undefined;
      assignedSlot?: HTMLSlotElement | null | undefined;
      attributeStyleMap?: StylePropertyMap | undefined;
      style?: CSSStyleDeclaration | undefined;
      contentEditable?: string | undefined;
      enterKeyHint?: string | undefined;
      inputMode?: string | undefined;
      isContentEditable?: boolean | undefined;
      onabort?: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null | undefined;
      onanimationcancel?:
        | ((this: GlobalEventHandlers, ev: AnimationEvent) => any)
        | null
        | undefined;
      onanimationend?: ((this: GlobalEventHandlers, ev: AnimationEvent) => any) | null | undefined;
      onanimationiteration?:
        | ((this: GlobalEventHandlers, ev: AnimationEvent) => any)
        | null
        | undefined;
      onanimationstart?:
        | ((this: GlobalEventHandlers, ev: AnimationEvent) => any)
        | null
        | undefined;
      onauxclick?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onbeforeinput?: ((this: GlobalEventHandlers, ev: InputEvent) => any) | null | undefined;
      onbeforematch?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onbeforetoggle?: ((this: GlobalEventHandlers, ev: ToggleEvent) => any) | null | undefined;
      onblur?: ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null | undefined;
      oncancel?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncanplay?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncanplaythrough?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onchange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onclick?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onclose?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncommand?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncontextlost?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncontextmenu?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      oncontextrestored?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncopy?: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null | undefined;
      oncuechange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncut?: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null | undefined;
      ondblclick?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      ondrag?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondragend?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondragenter?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondragleave?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondragover?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondragstart?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondrop?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondurationchange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onemptied?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onended?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onerror?: OnErrorEventHandler | undefined;
      onfocus?: ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null | undefined;
      onformdata?: ((this: GlobalEventHandlers, ev: FormDataEvent) => any) | null | undefined;
      ongotpointercapture?:
        | ((this: GlobalEventHandlers, ev: PointerEvent) => any)
        | null
        | undefined;
      oninput?: ((this: GlobalEventHandlers, ev: InputEvent) => any) | null | undefined;
      oninvalid?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onkeydown?: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null | undefined;
      onkeypress?: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null | undefined;
      onkeyup?: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null | undefined;
      onload?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onloadeddata?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onloadedmetadata?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onloadstart?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onlostpointercapture?:
        | ((this: GlobalEventHandlers, ev: PointerEvent) => any)
        | null
        | undefined;
      onmousedown?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmouseenter?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmouseleave?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmousemove?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmouseout?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmouseover?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmouseup?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onpaste?: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null | undefined;
      onpause?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onplay?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onplaying?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onpointercancel?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerdown?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerenter?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerleave?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointermove?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerout?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerover?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerrawupdate?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onpointerup?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onprogress?: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null | undefined;
      onratechange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onreset?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onresize?: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null | undefined;
      onscroll?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onscrollend?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onsecuritypolicyviolation?:
        | ((this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent) => any)
        | null
        | undefined;
      onseeked?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onseeking?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onselect?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onselectionchange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onselectstart?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onslotchange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onstalled?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onsubmit?: ((this: GlobalEventHandlers, ev: SubmitEvent) => any) | null | undefined;
      onsuspend?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      ontimeupdate?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      ontoggle?: ((this: GlobalEventHandlers, ev: ToggleEvent) => any) | null | undefined;
      ontouchcancel?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null | undefined;
      ontouchend?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null | undefined;
      ontouchmove?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null | undefined;
      ontouchstart?: ((this: GlobalEventHandlers, ev: TouchEvent) => any) | null | undefined;
      ontransitioncancel?:
        | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
        | null
        | undefined;
      ontransitionend?:
        | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
        | null
        | undefined;
      ontransitionrun?:
        | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
        | null
        | undefined;
      ontransitionstart?:
        | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
        | null
        | undefined;
      onvolumechange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onwaiting?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onwebkitanimationend?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onwebkitanimationiteration?:
        | ((this: GlobalEventHandlers, ev: Event) => any)
        | null
        | undefined;
      onwebkitanimationstart?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onwebkittransitionend?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onwheel?: ((this: GlobalEventHandlers, ev: WheelEvent) => any) | null | undefined;
      autofocus?: boolean | undefined;
      dataset?: DOMStringMap | undefined;
      nonce?: string | undefined;
      tabIndex?: number | undefined;
      blur?: (() => void) | undefined;
      focus?: ((options?: FocusOptions) => void) | undefined;
    };
    css: {
      as?: string | undefined;
      blocking?: DOMTokenList | undefined;
      charset?: string | undefined;
      crossOrigin?: string | null | undefined;
      disabled?: boolean | undefined;
      fetchPriority?: 'auto' | 'high' | 'low' | undefined;
      href: string;
      hreflang?: string | undefined;
      imageSizes?: string | undefined;
      imageSrcset?: string | undefined;
      integrity?: string | undefined;
      media?: string | undefined;
      referrerPolicy?: string | undefined;
      rel?: string | undefined;
      relList?: DOMTokenList | undefined;
      rev?: string | undefined;
      sizes?: DOMTokenList | undefined;
      target?: string | undefined;
      type?: string | undefined;
      addEventListener?:
        | {
            <K extends keyof HTMLElementEventMap>(
              type: K,
              listener: (this: HTMLLinkElement, ev: HTMLElementEventMap[K]) => any,
              options?: boolean | AddEventListenerOptions,
            ): void;
            (
              type: string,
              listener: EventListenerOrEventListenerObject,
              options?: boolean | AddEventListenerOptions,
            ): void;
          }
        | undefined;
      removeEventListener?:
        | {
            <K extends keyof HTMLElementEventMap>(
              type: K,
              listener: (this: HTMLLinkElement, ev: HTMLElementEventMap[K]) => any,
              options?: boolean | EventListenerOptions,
            ): void;
            (
              type: string,
              listener: EventListenerOrEventListenerObject,
              options?: boolean | EventListenerOptions,
            ): void;
          }
        | undefined;
      accessKey?: string | undefined;
      accessKeyLabel?: string | undefined;
      autocapitalize?: string | undefined;
      autocorrect?: boolean | undefined;
      dir?: string | undefined;
      draggable?: boolean | undefined;
      hidden?: boolean | 'until-found' | undefined;
      inert?: boolean | undefined;
      innerText?: string | undefined;
      lang?: string | undefined;
      offsetHeight?: number | undefined;
      offsetLeft?: number | undefined;
      offsetParent?: Element | null | undefined;
      offsetTop?: number | undefined;
      offsetWidth?: number | undefined;
      outerText?: string | undefined;
      popover?: string | null | undefined;
      spellcheck?: boolean | undefined;
      title?: string | undefined;
      translate?: boolean | undefined;
      writingSuggestions?: string | undefined;
      attachInternals?: (() => ElementInternals) | undefined;
      click?: (() => void) | undefined;
      hidePopover?: (() => void) | undefined;
      showPopover?: ((options?: ShowPopoverOptions) => void) | undefined;
      togglePopover?: ((options?: TogglePopoverOptions | boolean) => boolean) | undefined;
      attributes?: NamedNodeMap | undefined;
      classList?: DOMTokenList | undefined;
      className?: string | undefined;
      clientHeight?: number | undefined;
      clientLeft?: number | undefined;
      clientTop?: number | undefined;
      clientWidth?: number | undefined;
      currentCSSZoom?: number | undefined;
      customElementRegistry?: CustomElementRegistry | null | undefined;
      id?: string | undefined;
      innerHTML?: string | undefined;
      localName?: string | undefined;
      namespaceURI?: string | null | undefined;
      onfullscreenchange?: ((this: Element, ev: Event) => any) | null | undefined;
      onfullscreenerror?: ((this: Element, ev: Event) => any) | null | undefined;
      outerHTML?: string | undefined;
      ownerDocument?: Document | undefined;
      part?: DOMTokenList | undefined;
      prefix?: string | null | undefined;
      scrollHeight?: number | undefined;
      scrollLeft?: number | undefined;
      scrollTop?: number | undefined;
      scrollWidth?: number | undefined;
      shadowRoot?: ShadowRoot | null | undefined;
      slot?: string | undefined;
      tagName?: string | undefined;
      attachShadow?: ((init: ShadowRootInit) => ShadowRoot) | undefined;
      checkVisibility?: ((options?: CheckVisibilityOptions) => boolean) | undefined;
      closest?:
        | {
            <K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
            <K extends keyof SVGElementTagNameMap>(selector: K): SVGElementTagNameMap[K] | null;
            <K extends keyof MathMLElementTagNameMap>(
              selector: K,
            ): MathMLElementTagNameMap[K] | null;
            <E extends Element = Element>(selectors: string): E | null;
          }
        | undefined;
      computedStyleMap?: (() => StylePropertyMapReadOnly) | undefined;
      getAttribute?: ((qualifiedName: string) => string | null) | undefined;
      getAttributeNS?: ((namespace: string | null, localName: string) => string | null) | undefined;
      getAttributeNames?: (() => string[]) | undefined;
      getAttributeNode?: ((qualifiedName: string) => Attr | null) | undefined;
      getAttributeNodeNS?:
        | ((namespace: string | null, localName: string) => Attr | null)
        | undefined;
      getBoundingClientRect?: (() => DOMRect) | undefined;
      getClientRects?: (() => DOMRectList) | undefined;
      getElementsByClassName?: ((classNames: string) => HTMLCollectionOf<Element>) | undefined;
      getElementsByTagName?:
        | {
            <K extends keyof HTMLElementTagNameMap>(
              qualifiedName: K,
            ): HTMLCollectionOf<HTMLElementTagNameMap[K]>;
            <K extends keyof SVGElementTagNameMap>(
              qualifiedName: K,
            ): HTMLCollectionOf<SVGElementTagNameMap[K]>;
            <K extends keyof MathMLElementTagNameMap>(
              qualifiedName: K,
            ): HTMLCollectionOf<MathMLElementTagNameMap[K]>;
            <K extends keyof HTMLElementDeprecatedTagNameMap>(
              qualifiedName: K,
            ): HTMLCollectionOf<HTMLElementDeprecatedTagNameMap[K]>;
            (qualifiedName: string): HTMLCollectionOf<Element>;
          }
        | undefined;
      getElementsByTagNameNS?:
        | {
            (
              namespaceURI: 'http://www.w3.org/1999/xhtml',
              localName: string,
            ): HTMLCollectionOf<HTMLElement>;
            (
              namespaceURI: 'http://www.w3.org/2000/svg',
              localName: string,
            ): HTMLCollectionOf<SVGElement>;
            (
              namespaceURI: 'http://www.w3.org/1998/Math/MathML',
              localName: string,
            ): HTMLCollectionOf<MathMLElement>;
            (namespace: string | null, localName: string): HTMLCollectionOf<Element>;
          }
        | undefined;
      getHTML?: ((options?: GetHTMLOptions) => string) | undefined;
      hasAttribute?: ((qualifiedName: string) => boolean) | undefined;
      hasAttributeNS?: ((namespace: string | null, localName: string) => boolean) | undefined;
      hasAttributes?: (() => boolean) | undefined;
      hasPointerCapture?: ((pointerId: number) => boolean) | undefined;
      insertAdjacentElement?:
        | ((where: InsertPosition, element: Element) => Element | null)
        | undefined;
      insertAdjacentHTML?: ((position: InsertPosition, string: string) => void) | undefined;
      insertAdjacentText?: ((where: InsertPosition, data: string) => void) | undefined;
      matches?:
        | {
            <K extends keyof HTMLElementTagNameMap>(selectors: K): this is HTMLElementTagNameMap[K];
            <K extends keyof SVGElementTagNameMap>(selectors: K): this is SVGElementTagNameMap[K];
            <K extends keyof MathMLElementTagNameMap>(
              selectors: K,
            ): this is MathMLElementTagNameMap[K];
            (selectors: string): boolean;
          }
        | undefined;
      releasePointerCapture?: ((pointerId: number) => void) | undefined;
      removeAttribute?: ((qualifiedName: string) => void) | undefined;
      removeAttributeNS?: ((namespace: string | null, localName: string) => void) | undefined;
      removeAttributeNode?: ((attr: Attr) => Attr) | undefined;
      requestFullscreen?: ((options?: FullscreenOptions) => Promise<void>) | undefined;
      requestPointerLock?: ((options?: PointerLockOptions) => Promise<void>) | undefined;
      scroll?:
        | {
            (options?: ScrollToOptions): void;
            (x: number, y: number): void;
          }
        | undefined;
      scrollBy?:
        | {
            (options?: ScrollToOptions): void;
            (x: number, y: number): void;
          }
        | undefined;
      scrollIntoView?: ((arg?: boolean | ScrollIntoViewOptions) => void) | undefined;
      scrollTo?:
        | {
            (options?: ScrollToOptions): void;
            (x: number, y: number): void;
          }
        | undefined;
      setAttribute?: ((qualifiedName: string, value: string) => void) | undefined;
      setAttributeNS?:
        | ((namespace: string | null, qualifiedName: string, value: string) => void)
        | undefined;
      setAttributeNode?: ((attr: Attr) => Attr | null) | undefined;
      setAttributeNodeNS?: ((attr: Attr) => Attr | null) | undefined;
      setHTMLUnsafe?: ((html: string) => void) | undefined;
      setPointerCapture?: ((pointerId: number) => void) | undefined;
      toggleAttribute?: ((qualifiedName: string, force?: boolean) => boolean) | undefined;
      webkitMatchesSelector?: ((selectors: string) => boolean) | undefined;
      textContent?: string | undefined;
      baseURI?: string | undefined;
      childNodes?: NodeListOf<ChildNode> | undefined;
      firstChild?: ChildNode | null | undefined;
      isConnected?: boolean | undefined;
      lastChild?: ChildNode | null | undefined;
      nextSibling?: ChildNode | null | undefined;
      nodeName?: string | undefined;
      nodeType?: number | undefined;
      nodeValue?: string | null | undefined;
      parentElement?: HTMLElement | null | undefined;
      parentNode?: ParentNode | null | undefined;
      previousSibling?: ChildNode | null | undefined;
      appendChild?: (<T extends Node>(node: T) => T) | undefined;
      cloneNode?: ((subtree?: boolean) => Node) | undefined;
      compareDocumentPosition?: ((other: Node) => number) | undefined;
      contains?: ((other: Node | null) => boolean) | undefined;
      getRootNode?: ((options?: GetRootNodeOptions) => Node) | undefined;
      hasChildNodes?: (() => boolean) | undefined;
      insertBefore?: (<T extends Node>(node: T, child: Node | null) => T) | undefined;
      isDefaultNamespace?: ((namespace: string | null) => boolean) | undefined;
      isEqualNode?: ((otherNode: Node | null) => boolean) | undefined;
      isSameNode?: ((otherNode: Node | null) => boolean) | undefined;
      lookupNamespaceURI?: ((prefix: string | null) => string | null) | undefined;
      lookupPrefix?: ((namespace: string | null) => string | null) | undefined;
      normalize?: (() => void) | undefined;
      removeChild?: (<T extends Node>(child: T) => T) | undefined;
      replaceChild?: (<T extends Node>(node: Node, child: T) => T) | undefined;
      ELEMENT_NODE?: 1 | undefined;
      ATTRIBUTE_NODE?: 2 | undefined;
      TEXT_NODE?: 3 | undefined;
      CDATA_SECTION_NODE?: 4 | undefined;
      ENTITY_REFERENCE_NODE?: 5 | undefined;
      ENTITY_NODE?: 6 | undefined;
      PROCESSING_INSTRUCTION_NODE?: 7 | undefined;
      COMMENT_NODE?: 8 | undefined;
      DOCUMENT_NODE?: 9 | undefined;
      DOCUMENT_TYPE_NODE?: 10 | undefined;
      DOCUMENT_FRAGMENT_NODE?: 11 | undefined;
      NOTATION_NODE?: 12 | undefined;
      DOCUMENT_POSITION_DISCONNECTED?: 1 | undefined;
      DOCUMENT_POSITION_PRECEDING?: 2 | undefined;
      DOCUMENT_POSITION_FOLLOWING?: 4 | undefined;
      DOCUMENT_POSITION_CONTAINS?: 8 | undefined;
      DOCUMENT_POSITION_CONTAINED_BY?: 16 | undefined;
      DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC?: 32 | undefined;
      dispatchEvent?: ((event: Event) => boolean) | undefined;
      ariaActiveDescendantElement?: Element | null | undefined;
      ariaAtomic?: string | null | undefined;
      ariaAutoComplete?: string | null | undefined;
      ariaBrailleLabel?: string | null | undefined;
      ariaBrailleRoleDescription?: string | null | undefined;
      ariaBusy?: string | null | undefined;
      ariaChecked?: string | null | undefined;
      ariaColCount?: string | null | undefined;
      ariaColIndex?: string | null | undefined;
      ariaColIndexText?: string | null | undefined;
      ariaColSpan?: string | null | undefined;
      ariaControlsElements?: readonly Element[] | null | undefined;
      ariaCurrent?: string | null | undefined;
      ariaDescribedByElements?: readonly Element[] | null | undefined;
      ariaDescription?: string | null | undefined;
      ariaDetailsElements?: readonly Element[] | null | undefined;
      ariaDisabled?: string | null | undefined;
      ariaErrorMessageElements?: readonly Element[] | null | undefined;
      ariaExpanded?: string | null | undefined;
      ariaFlowToElements?: readonly Element[] | null | undefined;
      ariaHasPopup?: string | null | undefined;
      ariaHidden?: string | null | undefined;
      ariaInvalid?: string | null | undefined;
      ariaKeyShortcuts?: string | null | undefined;
      ariaLabel?: string | null | undefined;
      ariaLabelledByElements?: readonly Element[] | null | undefined;
      ariaLevel?: string | null | undefined;
      ariaLive?: string | null | undefined;
      ariaModal?: string | null | undefined;
      ariaMultiLine?: string | null | undefined;
      ariaMultiSelectable?: string | null | undefined;
      ariaOrientation?: string | null | undefined;
      ariaOwnsElements?: readonly Element[] | null | undefined;
      ariaPlaceholder?: string | null | undefined;
      ariaPosInSet?: string | null | undefined;
      ariaPressed?: string | null | undefined;
      ariaReadOnly?: string | null | undefined;
      ariaRelevant?: string | null | undefined;
      ariaRequired?: string | null | undefined;
      ariaRoleDescription?: string | null | undefined;
      ariaRowCount?: string | null | undefined;
      ariaRowIndex?: string | null | undefined;
      ariaRowIndexText?: string | null | undefined;
      ariaRowSpan?: string | null | undefined;
      ariaSelected?: string | null | undefined;
      ariaSetSize?: string | null | undefined;
      ariaSort?: string | null | undefined;
      ariaValueMax?: string | null | undefined;
      ariaValueMin?: string | null | undefined;
      ariaValueNow?: string | null | undefined;
      ariaValueText?: string | null | undefined;
      role?: string | null | undefined;
      animate?:
        | ((
            keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
            options?: number | KeyframeAnimationOptions,
          ) => Animation)
        | undefined;
      getAnimations?: ((options?: GetAnimationsOptions) => Animation[]) | undefined;
      after?: ((...nodes: (Node | string)[]) => void) | undefined;
      before?: ((...nodes: (Node | string)[]) => void) | undefined;
      remove?: (() => void) | undefined;
      replaceWith?: ((...nodes: (Node | string)[]) => void) | undefined;
      nextElementSibling?: Element | null | undefined;
      previousElementSibling?: Element | null | undefined;
      childElementCount?: number | undefined;
      children?: HTMLCollection | undefined;
      firstElementChild?: Element | null | undefined;
      lastElementChild?: Element | null | undefined;
      append?: ((...nodes: (Node | string)[]) => void) | undefined;
      moveBefore?: ((node: Node, child: Node | null) => void) | undefined;
      prepend?: ((...nodes: (Node | string)[]) => void) | undefined;
      querySelector?:
        | {
            <K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
            <K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
            <K extends keyof MathMLElementTagNameMap>(
              selectors: K,
            ): MathMLElementTagNameMap[K] | null;
            <K extends keyof HTMLElementDeprecatedTagNameMap>(
              selectors: K,
            ): HTMLElementDeprecatedTagNameMap[K] | null;
            <E extends Element = Element>(selectors: string): E | null;
          }
        | undefined;
      querySelectorAll?:
        | {
            <K extends keyof HTMLElementTagNameMap>(
              selectors: K,
            ): NodeListOf<HTMLElementTagNameMap[K]>;
            <K extends keyof SVGElementTagNameMap>(
              selectors: K,
            ): NodeListOf<SVGElementTagNameMap[K]>;
            <K extends keyof MathMLElementTagNameMap>(
              selectors: K,
            ): NodeListOf<MathMLElementTagNameMap[K]>;
            <K extends keyof HTMLElementDeprecatedTagNameMap>(
              selectors: K,
            ): NodeListOf<HTMLElementDeprecatedTagNameMap[K]>;
            <E extends Element = Element>(selectors: string): NodeListOf<E>;
          }
        | undefined;
      replaceChildren?: ((...nodes: (Node | string)[]) => void) | undefined;
      assignedSlot?: HTMLSlotElement | null | undefined;
      attributeStyleMap?: StylePropertyMap | undefined;
      style?: CSSStyleDeclaration | undefined;
      contentEditable?: string | undefined;
      enterKeyHint?: string | undefined;
      inputMode?: string | undefined;
      isContentEditable?: boolean | undefined;
      onabort?: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null | undefined;
      onanimationcancel?:
        | ((this: GlobalEventHandlers, ev: AnimationEvent) => any)
        | null
        | undefined;
      onanimationend?: ((this: GlobalEventHandlers, ev: AnimationEvent) => any) | null | undefined;
      onanimationiteration?:
        | ((this: GlobalEventHandlers, ev: AnimationEvent) => any)
        | null
        | undefined;
      onanimationstart?:
        | ((this: GlobalEventHandlers, ev: AnimationEvent) => any)
        | null
        | undefined;
      onauxclick?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onbeforeinput?: ((this: GlobalEventHandlers, ev: InputEvent) => any) | null | undefined;
      onbeforematch?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onbeforetoggle?: ((this: GlobalEventHandlers, ev: ToggleEvent) => any) | null | undefined;
      onblur?: ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null | undefined;
      oncancel?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncanplay?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncanplaythrough?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onchange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onclick?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onclose?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncommand?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncontextlost?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncontextmenu?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      oncontextrestored?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncopy?: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null | undefined;
      oncuechange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      oncut?: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null | undefined;
      ondblclick?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      ondrag?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondragend?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondragenter?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondragleave?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondragover?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondragstart?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondrop?: ((this: GlobalEventHandlers, ev: DragEvent) => any) | null | undefined;
      ondurationchange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onemptied?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onended?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onerror?: OnErrorEventHandler | undefined;
      onfocus?: ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null | undefined;
      onformdata?: ((this: GlobalEventHandlers, ev: FormDataEvent) => any) | null | undefined;
      ongotpointercapture?:
        | ((this: GlobalEventHandlers, ev: PointerEvent) => any)
        | null
        | undefined;
      oninput?: ((this: GlobalEventHandlers, ev: InputEvent) => any) | null | undefined;
      oninvalid?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onkeydown?: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null | undefined;
      onkeypress?: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null | undefined;
      onkeyup?: ((this: GlobalEventHandlers, ev: KeyboardEvent) => any) | null | undefined;
      onload?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onloadeddata?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onloadedmetadata?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onloadstart?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onlostpointercapture?:
        | ((this: GlobalEventHandlers, ev: PointerEvent) => any)
        | null
        | undefined;
      onmousedown?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmouseenter?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmouseleave?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmousemove?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmouseout?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmouseover?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onmouseup?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null | undefined;
      onpaste?: ((this: GlobalEventHandlers, ev: ClipboardEvent) => any) | null | undefined;
      onpause?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onplay?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onplaying?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onpointercancel?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerdown?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerenter?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerleave?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointermove?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerout?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerover?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onpointerrawupdate?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onpointerup?: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null | undefined;
      onprogress?: ((this: GlobalEventHandlers, ev: ProgressEvent) => any) | null | undefined;
      onratechange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onreset?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onresize?: ((this: GlobalEventHandlers, ev: UIEvent) => any) | null | undefined;
      onscroll?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onscrollend?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onsecuritypolicyviolation?:
        | ((this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent) => any)
        | null
        | undefined;
      onseeked?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onseeking?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onselect?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onselectionchange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onselectstart?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onslotchange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onstalled?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onsubmit?: ((this: GlobalEventHandlers, ev: SubmitEvent) => any) | null | undefined;
      onsuspend?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      ontimeupdate?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      ontoggle?: ((this: GlobalEventHandlers, ev: ToggleEvent) => any) | null | undefined;
      ontouchcancel?:
        | ((this: GlobalEventHandlers, ev: TouchEvent) => any)
        | null
        | undefined
        | undefined;
      ontouchend?:
        | ((this: GlobalEventHandlers, ev: TouchEvent) => any)
        | null
        | undefined
        | undefined;
      ontouchmove?:
        | ((this: GlobalEventHandlers, ev: TouchEvent) => any)
        | null
        | undefined
        | undefined;
      ontouchstart?:
        | ((this: GlobalEventHandlers, ev: TouchEvent) => any)
        | null
        | undefined
        | undefined;
      ontransitioncancel?:
        | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
        | null
        | undefined;
      ontransitionend?:
        | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
        | null
        | undefined;
      ontransitionrun?:
        | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
        | null
        | undefined;
      ontransitionstart?:
        | ((this: GlobalEventHandlers, ev: TransitionEvent) => any)
        | null
        | undefined;
      onvolumechange?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onwaiting?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onwebkitanimationend?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onwebkitanimationiteration?:
        | ((this: GlobalEventHandlers, ev: Event) => any)
        | null
        | undefined;
      onwebkitanimationstart?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onwebkittransitionend?: ((this: GlobalEventHandlers, ev: Event) => any) | null | undefined;
      onwheel?: ((this: GlobalEventHandlers, ev: WheelEvent) => any) | null | undefined;
      autofocus?: boolean | undefined;
      dataset?: DOMStringMap | undefined;
      nonce?: string | undefined;
      tabIndex?: number | undefined;
      blur?: (() => void) | undefined;
      focus?: ((options?: FocusOptions) => void) | undefined;
      sheet?: CSSStyleSheet | null | undefined;
    };
  },
  IStaticTextDefaultValue,
];
/**
 * 收集整理公共配置
 * highlight及language重构
 * [ISettingType, (k: keyof typeof setting) => void] => {}
 * @param props
 * @returns
 */
export declare const useConfig: (props: IEditorProps) => [any, any, ISettingType, TUpdateSetting];
/**
 * 向外暴露属性
 *
 * @param editorRef 绑定的ref
 * @param staticProps 静态属性
 * @param catalogVisible 目录显示状态
 * @param setting 内部状态集合
 * @param updateSetting 更新内部集合
 */
export declare const useExpose: (
  editorRef: ForwardedRef<unknown>,
  staticProps: IStaticProps,
  catalogVisible: boolean,
  setting: ISettingType,
  updateSetting: TUpdateSetting,
  codeRef: MutableRefObject<IContentExposeParam | undefined>,
) => void;
export declare const useEditorId: (props: IMdPreviewProps) => string;
