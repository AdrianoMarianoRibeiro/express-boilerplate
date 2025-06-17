import 'reflect-metadata';

export const PARAMS_KEY = Symbol('params');

export interface ParamMetadata {
  index: number;
  type: 'param' | 'query' | 'body' | 'headers';
  key?: string;
}

export function Param(key?: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    const existingParams: ParamMetadata[] =
      Reflect.getMetadata(PARAMS_KEY, target, propertyKey) || [];

    existingParams.push({
      index: parameterIndex,
      type: 'param',
      key,
    });

    Reflect.defineMetadata(PARAMS_KEY, existingParams, target, propertyKey);
  };
}

export function Query(key?: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    const existingParams: ParamMetadata[] =
      Reflect.getMetadata(PARAMS_KEY, target, propertyKey) || [];

    existingParams.push({
      index: parameterIndex,
      type: 'query',
      key,
    });

    Reflect.defineMetadata(PARAMS_KEY, existingParams, target, propertyKey);
  };
}

export function Body() {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    const existingParams: ParamMetadata[] =
      Reflect.getMetadata(PARAMS_KEY, target, propertyKey) || [];

    existingParams.push({
      index: parameterIndex,
      type: 'body',
    });

    Reflect.defineMetadata(PARAMS_KEY, existingParams, target, propertyKey);
  };
}

export function Headers(key?: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) {
    const existingParams: ParamMetadata[] =
      Reflect.getMetadata(PARAMS_KEY, target, propertyKey) || [];

    existingParams.push({
      index: parameterIndex,
      type: 'headers',
      key,
    });

    Reflect.defineMetadata(PARAMS_KEY, existingParams, target, propertyKey);
  };
}
