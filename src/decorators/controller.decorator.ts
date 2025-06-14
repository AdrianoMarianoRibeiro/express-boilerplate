import { Request, Response, Router } from "express";
import "reflect-metadata";

export interface RouteDefinition {
  path: string;
  requestMethod: "get" | "post" | "put" | "delete" | "patch";
  methodName: string | symbol;
}

export const ROUTES_KEY = Symbol("routes");
export const CONTROLLER_KEY = Symbol("controller");

export function Controller(prefix: string = "") {
  return function (target: any) {
    Reflect.defineMetadata(CONTROLLER_KEY, prefix, target);

    if (!Reflect.hasMetadata(ROUTES_KEY, target)) {
      Reflect.defineMetadata(ROUTES_KEY, [], target);
    }
  };
}

function createMethodDecorator(
  method: "get" | "post" | "put" | "delete" | "patch"
) {
  return function (path: string = "") {
    return function (target: any, propertyKey: string | symbol) {
      if (!Reflect.hasMetadata(ROUTES_KEY, target.constructor)) {
        Reflect.defineMetadata(ROUTES_KEY, [], target.constructor);
      }

      const routes: RouteDefinition[] = Reflect.getMetadata(
        ROUTES_KEY,
        target.constructor
      );

      routes.push({
        requestMethod: method,
        path,
        methodName: propertyKey,
      });

      Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
    };
  };
}

export const Get = createMethodDecorator("get");
export const Post = createMethodDecorator("post");
export const Put = createMethodDecorator("put");
export const Delete = createMethodDecorator("delete");
export const Patch = createMethodDecorator("patch");
