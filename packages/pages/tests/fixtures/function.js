"use strict";
exports.__esModule = true;
exports.getPath = exports.config = void 0;
function helloWorld(request) {
  return {
    body: "Hello World",
    headers: {},
    statusCode: 200,
  };
}
exports["default"] = helloWorld;
exports.config = {
  name: "Hello World Testing Function",
};
var getPath = function () {
  return "hello";
};
exports.getPath = getPath;
