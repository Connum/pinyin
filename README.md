** This fork is used for my npm package `pinyin-separate`: https://github.com/Connum/npm-pinyin-separate/

# Pinyin Editor
A simple pinyin editor made in node.js

## Install
Use the Consul Docker:

https://github.com/beautybrands/consul


Run:
```
npm install
npm install -g knex
npm install -g gulp
bower install
knex migrate:latest
npm run init
```

Create a env.js file based on env.js.example


Load the Unihan Database:
```
./app/console unihan-load
```
## Prettier Git Hook

```
$ git config core.hooksPath hooks/
```

<img src="https://travis-ci.org/pierophp/pinyin.svg" alt="build:passed">

