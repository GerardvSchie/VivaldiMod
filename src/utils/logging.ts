import { createConsola, LogLevels } from "consola";
import type { ConsolaInstance } from "consola";

const logger: ConsolaInstance = createConsola({
  level: import.meta.env.DEV ? LogLevels.debug : LogLevels.warn,
  formatOptions: {
    date: true,
    colors: true,
    compact: false,
  },
});

// factory for module-scoped loggers
export function createLogger(module: string): ConsolaInstance {
  return logger.withTag(module); // prefixes all logs with [module]
}

export default logger;
