export interface IBusEvent {
  name: string;
  callback: (p?: any, p2?: any) => any;
}
declare class Bus {
  pools: {
    [race: string]: {
      [eventName: string]: Array<(p?: any) => any>;
    };
  };
  remove(race: string, name: string, func: (...p: any) => any): void;
  clear(race: string): void;
  on(race: string, event: IBusEvent): boolean;
  emit(race: string, name: string, ...params: unknown[]): void;
}
declare const _default: Bus;
export default _default;
