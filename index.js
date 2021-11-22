"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var os = __importStar(require("os"));
var moment_1 = __importDefault(require("moment"));
var LogType = /** @class */ (function () {
    function LogType(level, output, color) {
        if (color === void 0) { color = ""; }
        this.level = level;
        this.output = output;
        this.color = LogType._colorTable[color] || 7;
    }
    LogType._colorTable = {
        no: -1,
        black: 0,
        red: 1,
        green: 2,
        yellow: 3,
        blue: 4,
        purple: 5,
        cyan: 6,
        white: 7
    };
    return LogType;
}());
var Logger = /** @class */ (function () {
    function Logger(options) {
        if (options === void 0) { options = {}; }
        this._types = {
            DEBUG: new LogType(0, process.stdout, process.stdout.isTTY ? "cyan" : "no"),
            INFO: new LogType(20, process.stdout, process.stdout.isTTY ? "green" : "no"),
            WARN: new LogType(40, process.stderr, process.stderr.isTTY ? "yellow" : "no"),
            ERROR: new LogType(60, process.stderr, process.stderr.isTTY ? "red" : "no"),
            FATAL: new LogType(80, process.stderr, process.stderr.isTTY ? "purple" : "no")
        };
        this._formats = {};
        this._formats.oneline = "\x1b[1;3{color}m{type}\x1b[0;3{color}m [{date}] ({pid}:{ppid} {username}@{hostname}) \x1b[0;3m{tag}\x1b[0m - {message}";
        this._formats.short = "\x1b[1;3{color}m{type}\x1b[0;3{color}m [{date}] \x1b[0;3m{tag}\x1b[0m - {message}";
        this._formats.json = JSON.stringify({
            type: "{type}",
            level: "{level}",
            date: "{date}",
            pid: "{pid}",
            ppid: "{ppid}",
            username: "{username}",
            hostname: "{hostname}",
            tag: "{tag}",
            message: "{message}"
        });
        this._outputs = {
            stdout: process.stdout,
            stderr: process.stderr
        };
        this._format = this._formats[options.format] || this._formats.oneline;
        this._dateFormat = options.dateFormat || "YYYY-MM-DD HH:mm:ss";
        this._end = options.end || os.EOL;
        this._color = options.color == null ? true : options.color;
        this._level = options.level == null ? 20 : options.level;
        this._ignoreAll = options.ignoreAll == null ? false : options.ignoreAll;
        this._ignoreTags = new Set(options.ignoreTags) || [];
        this._acceptTags = new Set(options.acceptTags) || [];
    }
    Logger.prototype.format = function (format) {
        this._format = this._formats[format] || format;
    };
    Logger.prototype.dateFormat = function (format) {
        this._dateFormat = format;
    };
    Logger.prototype.end = function (literal) {
        this._end = literal;
    };
    Logger.prototype.color = function (flag) {
        if (flag === void 0) { flag = true; }
        this._color = flag;
    };
    Logger.prototype.uncolor = function () {
        this._color = false;
    };
    Logger.prototype.level = function (value) {
        this._level = value;
    };
    Logger.prototype.setFormat = function (name, format) {
        this._formats[name] = format;
    };
    Logger.prototype.setOutput = function (name, stream) {
        this._outputs[name] = stream;
    };
    Logger.prototype.setType = function (name, level, output, color) {
        if (output === void 0) { output = process.stderr; }
        this._types[name] = new LogType(level, output, color);
    };
    Logger.prototype.log = function (type, message, tag) {
        if (message === void 0) { message = ""; }
        if (tag === void 0) { tag = ""; }
        var logger = this._types[type];
        if (!logger || logger.level < this._level)
            return;
        if (this._ignoreTags.has(tag) || (this._ignoreAll && !this._acceptTags.has(tag)))
            return;
        var log = this._format
            .replace(/{type}/g, type)
            .replace(/{level}/g, String(logger.level))
            .replace(/{color}/g, String(logger.color))
            .replace(/{date}/g, (0, moment_1.default)().format(this._dateFormat))
            .replace(/{username}/g, os.userInfo().username)
            .replace(/{hostname}/g, os.hostname())
            .replace(/{pid}/g, String(process.pid))
            .replace(/{ppid}/g, String(process.ppid))
            .replace(/{tag}/g, tag)
            .replace(/{message}/g, message);
        if (!this._color || logger.color < 0)
            log = log.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})*)?[mGK]/g, "");
        logger.output.write(log);
        logger.output.write(this._end);
    };
    Logger.prototype.debug = function (message, tag) {
        if (tag === void 0) { tag = ""; }
        this.log("DEBUG", message, tag);
    };
    Logger.prototype.info = function (message, tag) {
        if (tag === void 0) { tag = ""; }
        this.log("INFO", message, tag);
    };
    Logger.prototype.warn = function (message, tag) {
        if (tag === void 0) { tag = ""; }
        this.log("WARN", message, tag);
    };
    Logger.prototype.error = function (message, tag) {
        if (tag === void 0) { tag = ""; }
        this.log("ERROR", message, tag);
    };
    Logger.prototype.fatal = function (message, tag) {
        if (tag === void 0) { tag = ""; }
        this.log("FATAL", message, tag);
    };
    Logger.prototype.onTag = function (tag) {
        this._ignoreTags.delete(tag);
        this._acceptTags.add(tag);
    };
    Logger.prototype.offTag = function (tag) {
        this._acceptTags.delete(tag);
        this._ignoreTags.add(tag);
    };
    Logger.prototype.onTags = function (tags) {
        for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
            var tag = tags_1[_i];
            this.onTag(tag);
        }
    };
    Logger.prototype.offTags = function (tags) {
        for (var _i = 0, tags_2 = tags; _i < tags_2.length; _i++) {
            var tag = tags_2[_i];
            this.offTag(tag);
        }
    };
    Logger.prototype.acceptAll = function (flag) {
        if (flag === void 0) { flag = true; }
        this._ignoreAll = !flag;
    };
    Logger.prototype.ignoreAll = function () {
        this._ignoreAll = true;
    };
    return Logger;
}());
exports.Logger = Logger;
