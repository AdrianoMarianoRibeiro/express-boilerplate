import { Request, Response } from 'express';
import 'reflect-metadata';
import { ParamMetadata, PARAMS_KEY } from './param.decorator';

export const CONTROLLER_KEY = Symbol('controller');
export const ROUTES_KEY = Symbol('routes');

export interface RouteDefinition {
  path: string;
  requestMethod: 'get' | 'post' | 'put' | 'delete' | 'patch';
  methodName: string | symbol;
}

export function Controller(prefix: string = '') {
  return function (target: Function) {
    Reflect.defineMetadata(CONTROLLER_KEY, prefix, target);
  };
}

// Helper function to extract parameters
export function extractParameters(
  target: any,
  methodName: string | symbol,
  req: Request,
  res: Response,
): any[] {
  const paramsMetadata: ParamMetadata[] =
    Reflect.getMetadata(PARAMS_KEY, target, methodName) || [];
  const methodParams =
    Reflect.getMetadata('design:paramtypes', target, methodName) || [];

  const args = new Array(methodParams.length);

  paramsMetadata.forEach((param) => {
    switch (param.type) {
      case 'param':
        args[param.index] = param.key ? req.params[param.key] : req.params;
        break;
      case 'query':
        args[param.index] = param.key ? req.query[param.key] : req.query;
        break;
      case 'body':
        args[param.index] = req.body;
        break;
      case 'headers':
        args[param.index] = param.key ? req.headers[param.key] : req.headers;
        break;
    }
  });

  return args;
}

function createRouteDecorator(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
) {
  return function (path: string = '') {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      const existingRoutes: RouteDefinition[] =
        Reflect.getMetadata(ROUTES_KEY, target.constructor) || [];

      existingRoutes.push({
        requestMethod: method,
        path,
        methodName: propertyKey,
      });

      Reflect.defineMetadata(ROUTES_KEY, existingRoutes, target.constructor);
    };
  };
}

export const Get = createRouteDecorator('get');
export const Post = createRouteDecorator('post');
export const Put = createRouteDecorator('put');
export const Delete = createRouteDecorator('delete');
export const Patch = createRouteDecorator('patch');
