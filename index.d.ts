/// <reference types="node" />
import { Writable as WriteStream } from "stream";
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
export declare class Logger {
    private _types;
    private _formats;
    private _outputs;
    private _format;
    private _dateFormat;
    private _end;
    private _color;
    private _level;
    private _ignoreAll;
    private _ignoreTags;
    private _acceptTags;
    constructor(options?: LoggerOptions);
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
}
export {};
