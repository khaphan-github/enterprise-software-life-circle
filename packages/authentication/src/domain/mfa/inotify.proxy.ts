export interface INotifyProxy {
  send(...args: any): Promise<any>;
}
