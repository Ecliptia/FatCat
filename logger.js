class Logger {
  _log(level, context, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] ${context}`;

    let trace = null;

    if (args.length > 0) {
      const last = args[args.length - 1];
      if (last instanceof Error || (last && typeof last.stack === "string")) {
        trace = last.stack;
        args = args.slice(0, -1);
      }
    }

    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg),
      )
      .join(" | ");

    const content = [message, trace ? `Trace: ${trace}` : null]
      .filter(Boolean)
      .join("\n");
    const final = content ? `${prefix} | ${content}` : prefix;

    const print = console[level] || console.log;

    print(final);
  }

  debug(context, ...args) {
    this._log("debug", context, ...args);
  }
  info(context, ...args) {
    this._log("info", context, ...args);
  }
  warn(context, ...args) {
    this._log("warn", context, ...args);
  }
  error(context, ...args) {
    this._log("error", context, ...args);
  }
}

export default new Logger();
