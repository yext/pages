"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPath = exports.config = void 0;
function helloWorld(_) {
  return {
    body: "Hello World",
    headers: {},
    statusCode: 200,
  };
}
exports.default = helloWorld;
exports.config = {
  name: "Hello World Testing Function",
};
var getPath = function () {
  return "hello/[param]";
};
exports.getPath = getPath;
