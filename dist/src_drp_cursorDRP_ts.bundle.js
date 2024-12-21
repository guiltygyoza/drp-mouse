/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkdrp_mouse"] = self["webpackChunkdrp_mouse"] || []).push([["src_drp_cursorDRP_ts"],{

/***/ "./src/drp/cursorDRP.ts":
/*!******************************!*\
  !*** ./src/drp/cursorDRP.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.CursorDRP = void 0;\nexports.createCursorDRP = createCursorDRP;\nconst object_1 = __webpack_require__(/*! @ts-drp/object */ \"./node_modules/@ts-drp/object/dist/src/index.js\");\nclass CursorDRP {\n    constructor() {\n        this.operations = [\"updateCursor\"];\n        this.semanticsType = object_1.SemanticsType.pair;\n        this.positions = new Map();\n    }\n    updateCursor(userId, position) {\n        this._updateCursor(userId, position);\n    }\n    _updateCursor(userId, position) {\n        this.positions.set(userId, position);\n    }\n    getCursorPosition(userId) {\n        return this.positions.get(userId);\n    }\n    getUsers() {\n        return [...this.positions.keys()];\n    }\n    resolveConflicts(vertices) {\n        return { action: object_1.ActionType.Nop };\n    }\n}\nexports.CursorDRP = CursorDRP;\nfunction createCursorDRP() {\n    return new CursorDRP();\n}\n\n\n//# sourceURL=webpack://drp-mouse/./src/drp/cursorDRP.ts?");

/***/ }),

/***/ "?d546":
/*!************************!*\
  !*** buffer (ignored) ***!
  \************************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/buffer_(ignored)?");

/***/ }),

/***/ "?8131":
/*!************************!*\
  !*** buffer (ignored) ***!
  \************************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/buffer_(ignored)?");

/***/ }),

/***/ "?3fc0":
/*!************************!*\
  !*** crypto (ignored) ***!
  \************************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/crypto_(ignored)?");

/***/ }),

/***/ "?cad2":
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/util_(ignored)?");

/***/ }),

/***/ "?593c":
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/util_(ignored)?");

/***/ }),

/***/ "?4068":
/*!************************!*\
  !*** buffer (ignored) ***!
  \************************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/buffer_(ignored)?");

/***/ }),

/***/ "?e7e4":
/*!************************!*\
  !*** buffer (ignored) ***!
  \************************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/buffer_(ignored)?");

/***/ }),

/***/ "?7bec":
/*!************************!*\
  !*** buffer (ignored) ***!
  \************************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/buffer_(ignored)?");

/***/ }),

/***/ "?0aec":
/*!************************!*\
  !*** buffer (ignored) ***!
  \************************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/buffer_(ignored)?");

/***/ }),

/***/ "?fbf1":
/*!************************!*\
  !*** buffer (ignored) ***!
  \************************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/buffer_(ignored)?");

/***/ }),

/***/ "?ed1b":
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/util_(ignored)?");

/***/ }),

/***/ "?d17e":
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://drp-mouse/util_(ignored)?");

/***/ })

}]);