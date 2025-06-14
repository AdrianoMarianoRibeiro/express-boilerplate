export interface ModuleOptions {
  controllers?: any[];
  providers?: any[];
  imports?: any[];
  exports?: any[];
}

export const MODULE_KEY = Symbol("module");

export function Module(options: ModuleOptions) {
  return function (target: any) {
    Reflect.defineMetadata(MODULE_KEY, options, target);
  };
}
