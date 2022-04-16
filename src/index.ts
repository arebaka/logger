import os from 'os'
import { Writable } from 'stream'
import moment from 'moment'

class LogType {

    private static _colorTable:{[name:string]: number} = {
        no:    -1,
        black:  0,
        red:    1,
        green:  2,
        yellow: 3,
        blue:   4,
        purple: 5,
        cyan:   6,
        white:  7,
    }

    public readonly level:number
    public readonly output:Writable
    public readonly color:number

    constructor(level:number, output:Writable, color:string='') {
        this.level  = level
        this.output = output
        this.color  = LogType._colorTable[color] || LogType._colorTable.white
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
    acceptTags?:string[],
}

export class Logger {

    private _types:{[name:string]: LogType}
    private _formats:{[name:string]: string} = {}
    private _outputs:{[name:string]: Writable}

    private _format:string
    private _dateFormat:string
    private _end:string
    private _color:boolean
    private _level:number
    private _ignoreAll:boolean
    private _ignoreTags:Set<string>
    private _acceptTags:Set<string>

    constructor(options:LoggerOptions={}) {
        this._types = {
            DEBUG: new LogType(0,  process.stdout, process.stdout.isTTY ? 'cyan'   : 'no'),
            INFO:  new LogType(20, process.stdout, process.stdout.isTTY ? 'green'  : 'no'),
            WARN:  new LogType(40, process.stderr, process.stderr.isTTY ? 'yellow' : 'no'),
            ERROR: new LogType(60, process.stderr, process.stderr.isTTY ? 'red'    : 'no'),
            FATAL: new LogType(80, process.stderr, process.stderr.isTTY ? 'purple' : 'no'),
        }

        this._formats = {
			oneline: '\x1b[1;3{color}m{type}\x1b[0;3{color}m [{date}] ({username}@{hostname} {pid}:{ppid}) \x1b[0;3m{tag}\x1b[0m - {message}',
        	short:   '\x1b[1;3{color}m{type}\x1b[0;3{color}m [{date}] \x1b[0;3m{tag}\x1b[0m - {message}',
		}

        this._formats.json = JSON.stringify({
            type:     '{type}',
            level:    '{level}',
            date:     '{date}',
            pid:      '{pid}',
            ppid:     '{ppid}',
            username: '{username}',
            hostname: '{hostname}',
            tag:      '{tag}',
            message:  '{message}'
        })

        this._outputs = {
            stdout: process.stdout,
            stderr: process.stderr,
        }

        this._format     = this._formats[options.format ?? 'oneline'] || this._formats.oneline
        this._dateFormat = options.dateFormat ?? 'YYYY-MM-DD HH:mm:ss'
        this._end        = options.end ?? os.EOL
        this._color      = options.color ?? true
        this._level      = options.level ?? 20
        this._ignoreAll  = options.ignoreAll ?? false
        this._ignoreTags = new Set<string>(options.ignoreTags ?? [])
        this._acceptTags = new Set<string>(options.acceptTags ?? [])
    }

    public format(format:string) : void {
        this._format = this._formats[format] ?? format
    }

    public dateFormat(format:string) : void {
        this._dateFormat = format
    }

    public end(literal:string=os.EOL) : void {
        this._end = literal
    }

    public color(flag:boolean=true) : void {
        this._color = flag
    }

    public uncolor() : void {
        this._color = false
    }

    public level(value:number) : void {
        this._level = value
    }

    public setFormat(name:string, format:string) : void {
        this._formats[name] = format
    }

    public setOutput(name:string, stream:Writable) : void {
        this._outputs[name] = stream
    }

    public setType(name:string, level:number, output:Writable=process.stdout, color:string) : void {
        this._types[name] = new LogType(level, output, color)
    }

    public log(type:string, message:string='', tag:string='') : void {
        const logType:LogType|undefined = this._types[type]

        if (logType == null || logType.level < this._level)
			return
        if (this._ignoreTags.has(tag) || (this._ignoreAll && !this._acceptTags.has(tag)))
			return

        let log:string = this._format
            .replace(/{type}/g,     type)
            .replace(/{level}/g,    String(logType.level))
            .replace(/{color}/g,    String(logType.color))
            .replace(/{date}/g,     moment().format(this._dateFormat))
            .replace(/{username}/g, os.userInfo().username)
            .replace(/{hostname}/g, os.hostname())
            .replace(/{pid}/g,      String(process.pid))
            .replace(/{ppid}/g,     String(process.ppid))
            .replace(/{tag}/g,      tag)
            .replace(/{message}/g,  message)

        if (!this._color || logType.color < 0)
            log = log.replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})*)?[mGK]/g, '')  // remove ANSI escape codes if no color

        logType.output.write(log)
        logType.output.write(this._end)
    }

    public debug(message:string, tag:string='') : void {
        this.log('DEBUG', message, tag)
    }

    public info(message:string, tag:string='') : void {
        this.log('INFO', message, tag)
    }

    public warn(message:string, tag:string='') : void {
        this.log('WARN', message, tag)
    }

    public error(message:string, tag:string='') : void {
        this.log('ERROR', message, tag)
    }

    public fatal(message:string, tag:string='') : void {
        this.log('FATAL', message, tag)
    }

    public onTag(tag:string) : void {
        this._ignoreTags.delete(tag)
        this._acceptTags.add(tag)
    }

    public offTag(tag:string) : void {
        this._acceptTags.delete(tag)
        this._ignoreTags.add(tag)
    }

    public onTags(tags:string[]) : void {
        for (let tag of tags) {
            this.onTag(tag)
        }
    }

    public offTags(tags:string[]) : void {
        for(let tag of tags) {
            this.offTag(tag)
        }
    }

    public acceptAll(flag:boolean=true) : void {
        this._ignoreAll = !flag
    }

    public ignoreAll() : void {
        this._ignoreAll = true
    }
}
