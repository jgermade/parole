
module.exports = function (Promise) {

  Promise.when = function (p) { return ( p && p.then ) ? p : Promise.resolve(p); };

  return Promise;
};
