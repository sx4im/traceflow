
// Types used throughout the code parser module
export interface LineInfo {
  lineNumber: number;
  content: string;
  isEmpty: boolean;
  isComment: boolean;
}

export interface Variable {
  name: string;
  value: string;  // Always stored as string for consistent display
  type: string;
  scope: string;
}

export interface ScopeContext {
  name: string;
  variables: Record<string, Variable>;
}

export interface ConsoleOutputItem {
  type: "log" | "error" | "warning" | "info";  // Updated to match ConsoleMessage type
  content: string;
  timestamp: Date;
}

export interface ExecutionState {
  currentLine: number;
  variables: Variable[];
  callStack: string[];
  consoleOutput: ConsoleOutputItem[];
}

export interface ExecutionResult {
  states: ExecutionState[];
  totalSteps: number;
}
