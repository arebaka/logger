/// <reference types="node" />
import { Writable as WriteStream } from "stream";
declare class LogType {
    private static _colorTable;
    readonly level: number;
    readonly output: WriteStream;
    readonly color: number;
    constructor(level: number, output: WriteStream, color?: string);
}
declare type LoggerOptions = {
    format?: string;
    dateFormat?: string;
    end?: string;
    color?: boolean;
    level?: number;
    ignoreAll?: boolean;
    ignoreTags?: string[];
    acceptTags?: string[];
};
declare const _default: {
    new (options?: LoggerOptions): {
        _types: {
            [name: string]: LogType;
        };
        _formats: {
            [name: string]: string;
        };
        _outputs: {
            [name: string]: WriteStream;
        };
        _format: string;
        _dateFormat: string;
        _end: string;
        _color: boolean;
        _level: number;
        _ignoreAll: boolean;
        _ignoreTags: Set<string>;
        _acceptTags: Set<string>;
        format(format: string): void;
        dateFormat(format: string): void;
        end(literal: string): void;
        color(flag?: boolean): void;
        uncolor(): void;
        level(value: number): void;
        setFormat(name: string, format: string): void;
        setOutput(name: string, stream: WriteStream): void;
        setType(name: string, level: number, output: WriteStream | undefined, color: string): void;
        log(type: string, message?: string, tag?: string): void;
        debug(message: string, tag?: string): void;
        info(message: string, tag?: string): void;
        warn(message: string, tag?: string): void;
        error(message: string, tag?: string): void;
        fatal(message: string, tag?: string): void;
        onTag(tag: string): void;
        offTag(tag: string): void;
        onTags(tags: string[]): void;
        offTags(tags: string[]): void;
        acceptAll(flag?: boolean): void;
        ignoreAll(): void;
    };
};
export = _default;
