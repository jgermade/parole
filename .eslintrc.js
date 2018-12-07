module.exports = {
    "env": {
      "browser": true,
      "es6": true,
      "node": true,
    },
    "globals": {
      "module": true,
      "define": true,
      "require": true,
      "global": true
    },
    "parserOptions": {
      "sourceType": "module",
    },
    "extends": "eslint:recommended",
    "rules": {
      "linebreak-style": [
          "error",
          "unix"
      ],
      "quotes": [
          "error",
          "single"
      ],
      "semi": [
          "error",
          "never"
      ],
      "no-unused-vars": [
          "error",
          {
              "args": "after-used",
              "argsIgnorePattern": "^_\\w+"
          }
      ]
    }
};
