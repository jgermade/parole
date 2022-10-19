function isObject(o) {
  return typeof o === "object";
}
function isFunction(o) {
  return typeof o === "function";
}
function isIterable(o) {
  return o && isFunction(o[Symbol.iterator]);
}
function isThenable(o) {
  return o && (isObject(o) || isFunction(o)) && isFunction(o.then);
}
export {
  isFunction,
  isIterable,
  isObject,
  isThenable
};
