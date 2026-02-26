// Khai báo module cho các file không có type definitions
declare module "*.scss";
declare module "*.css";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";

// Khai báo cho react-flatpickr
declare module "react-flatpickr";

// Khai báo cho redux-auth-wrapper
declare module "redux-auth-wrapper/history4/locationHelper" {
  const locationHelperBuilder: (config?: any) => any;
  export default locationHelperBuilder;
}

declare module "redux-auth-wrapper/history4/redirect" {
  export function connectedRouterRedirect(config: any): any;
}

// Khai báo cho connected-react-router
declare module "connected-react-router" {
  import { Reducer, Middleware } from "redux";
  import { History } from "history";

  export function connectRouter(history: History): Reducer;
  export function routerMiddleware(history: History): Middleware;
  export function push(path: string): any;
  export const ConnectedRouter: any;
}

// Khai báo cho redux-state-sync
declare module "redux-state-sync" {
  export function createStateSyncMiddleware(config: any): any;
}

// Khai báo cho react-image-lightbox
declare module "react-image-lightbox" {
  const Lightbox: any;
  export default Lightbox;
}

// Khai báo cho react-markdown-editor-lite
declare module "react-markdown-editor-lite" {
  const MdEditor: any;
  export default MdEditor;
}

// Khai báo cho markdown-it
declare module "markdown-it" {
  const MarkdownIt: any;
  export default MarkdownIt;
}

// Khai báo cho Window Redux DevTools
interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
}
