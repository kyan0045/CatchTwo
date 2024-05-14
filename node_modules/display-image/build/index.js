"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const terminalImage = require("terminal-image");
const got = __importStar(require("got"));
/**
 * Get string for terminal output from image file
 * @param path Path to file
 */
exports.fromFile = (path) => __awaiter(this, void 0, void 0, function* () {
    return terminalImage.file(path);
});
/**
 * Get string for terminal output from image url
 * @param url URL of the image file
 */
exports.fromURL = (url) => __awaiter(this, void 0, void 0, function* () {
    const response = yield got.get(url, { encoding: null });
    return terminalImage.buffer(response.body);
});
