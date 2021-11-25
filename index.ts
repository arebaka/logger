import * as os from "os";
import { Writable as WriteStream } from "stream";
import moment from "moment";

class LogType
{
    private static _colorTable:{[name:string]: number} = {
        no:    -1,
        black:  0,
        red:    1,
        green:  2,
        yellow: 3,
        blue:   4,
        purple: 5,
        cyan:   6,
        white:  7
    };

    public readonly level:number;
    public readonly output:WriteStream;
    public readonly color:number;

    constructor(level:number, output:WriteStream, color:string="") {
        this.level  = level;
        this.output = output;
        this.color  = LogType._colorTable[color] || 7;
    }
}

type LoggerOptions = {
    format?:string,
    dateFormat?:string,
    end?:string,
    color?:boolean,
    level?:number,
    ignoreAll?:boolean,
    ignoreTags?:string[],
    acceptTags?:string[]
};

export class Logger
{
    private _types:{[name:string]: LogType};
    private _formats:{[name:string]: string};
    private _outputs:{[name:string]: WriteStream};

    private _format:string;
    private _dateFormat:string;
    private _end:string;
    private _color:boolean;
    private _level:number;
    private _ignoreAll:boolean;
    private _ignoreTags:Set<string>;
    private _acceptTags:Set<string>;

    constructor(options:LoggerOptions={}) {
        this._types = {
            DEBUG: new LogType(0,  process.stdout, process.stdout.isTTY ? "cyan"   : "no"),
            INFO:  new LogType(20, process.stdout, process.stdout.isTTY ? "green"  : "no"),
            WARN:  new LogType(40, process.stderr, process.stderr.isTTY ? "yellow" : "no"),
            ERROR: new LogType(60, process.stderr, process.stderr.isTTY ? "red"    : "no"),
            FATAL: new LogType(80, process.stderr, process.stderr.isTTY ? "purple" : "no")
        };

        this._formats         = {};
        this._formats.oneline = "\x1b[1;3{color}m{type}\x1b[0;3{color}m [{date}] ({username}@{hostname} {pid}:{ppid}) \x1b[0;3m{tag}\x1b[0m - {message}";
        this._formats.short   = "\x1b[1;3{color}m{type}\x1b[0;3{color}m [{date}] \x1b[0;3m{tag}\x1b[0m - {message}";

        this._formats.json = JSON.stringify({
            type:     "{type}",
            level:    "{level}",
            date:     "{date}",
            pid:      "{pid}",
            ppid:     "{ppid}",
            username: "{username}",
            hostname: "{hostname}",
            tag:      "{tag}",
            message:  "{message}"
        });

        this._outputs = {
            stdout: process.stdout,
            stderr: process.stderr
        };

        this._format     = this._formats[options.format as string] || this._formats.oneline;
        this._dateFormat = options.dateFormat || "YYYY-MM-DD HH:mm:ss";
        this._end        = options.end || os.EOL;
        this._color      = options.color == null ? true : options.color;
        this._level      = options.level == null ? 20 : options.level;
        this._ignoreAll  = options.ignoreAll == null ? false : options.ignoreAll;
        this._ignoreTags = new Set<string>(options.ignoreTags) || [];
        this._acceptTags = new Set<string>(options.acceptTags) || [];
    }

    public format(format:string) : void {
        this._format = this._formats[format] || format;
    }

    public dateFormat(format:string) : void {
        this._dateFormat = format;
    }

    public end(literal:string) : void {
        this._end = literal;
    }

    public color(flag:boolean=true) : void {
        this._color = flag;
    }

    public uncolor() : void {
        this._color = false;
    }

    public level(value:number) : void {
        this._level = value;
    }

    setFormat(name:string, format:string) : void {
        this._formats[name] = format;
    }

    setOutput(name:string, stream:WriteStream) : void {
        this._outputs[name] = stream;
    }

    setType(name:string, level:number, output:WriteStream=process.stderr, color:string) : void {
        this._types[name] = new LogType(level, output, color);
    }

    public log(type:string, message:string="", tag:string="") : void {
        const logger:LogType|undefined = this._types[type];

        if (!logger || logger.level < this._level) return;
        if (this._ignoreTags.has(tag) || (this._ignoreAll && !this._acceptTags.has(tag))) return;

        let log:string = this._format
            .replace(/{type}/g,     type)
            .replace(/{level}/g,    String(logger.level))
            .replace(/{color}/g,    String(logger.color))
            .replace(/{date}/g,     moment().format(this._dateFormat))
            .replace(/{username}/g, os.userInfo().username)
            .replace(/{hostname}/g, os.hostname())
            .replace(/{pid}/g,      String(process.pid))
            .replace(/{ppid}/g,     String(process.ppid))
            .replace(/{tag}/g,      tag)
            .replace(/{message}/g,  message)

        if (!this._color || logger.color < 0)
            log = log.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})*)?[mGK]/g, "");

        logger.output.write(log);
        logger.output.write(this._end);
    }

    public debug(message:string, tag:string="") : void {
        this.log("DEBUG", message, tag);
    }

    public info(message:string, tag:string="") : void {
        this.log("INFO", message, tag);
    }

    public warn(message:string, tag:string="") : void {
        this.log("WARN", message, tag);
    }

    public error(message:string, tag:string="") : void {
        this.log("ERROR", message, tag);
    }

    public fatal(message:string, tag:string="") : void {
        this.log("FATAL", message, tag);
    }

    public onTag(tag:string) : void {
        this._ignoreTags.delete(tag);
        this._acceptTags.add(tag);
    }

    public offTag(tag:string) : void {
        this._acceptTags.delete(tag);
        this._ignoreTags.add(tag);
    }

    public onTags(tags:string[]) : void {
        for (let tag of tags) {
            this.onTag(tag);
        }
    }

    public offTags(tags:string[]) : void {
        for(let tag of tags) {
            this.offTag(tag);
        }
    }

    public acceptAll(flag: boolean=true) : void {
        this._ignoreAll = !flag;
    }

    public ignoreAll() : void {
        this._ignoreAll = true;
    }
}
