import { extractLineInfo } from "./parser";
import { ExecutionResult, ConsoleOutputItem } from "./types";

// Fallback to simpler execution states when parsing fails
export function fallbackExecutionStates(code: string): ExecutionResult {
  const lines = extractLineInfo(code);
  const executionStates = [];
  
  // Simplified logic for execution states
  let variables = [];
  let callStack = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].isEmpty || lines[i].isComment) continue;
    
    // Simple variable detection
    if (lines[i].content.match(/\b(var|let|const)\s+([a-zA-Z_]\w*)\s*=/)) {
      const match = lines[i].content.match(/\b(var|let|const)\s+([a-zA-Z_]\w*)\s*=/);
      if (match && match[2]) {
        // Basic type inference
        let type = "string";
        let value = "unknown";
        
        if (lines[i].content.match(/=\s*\d+/)) {
          type = "number";
          const numMatch = lines[i].content.match(/=\s*(\d+)/);
          value = numMatch ? String(parseInt(numMatch[1])) : "0";
        } else if (lines[i].content.match(/=\s*["']/)) {
          type = "string";
          const strMatch = lines[i].content.match(/=\s*["'](.*)["']/);
          value = strMatch ? strMatch[1] : "";
        } else if (lines[i].content.match(/=\s*(true|false)/i)) {
          type = "boolean";
          value = String(lines[i].content.includes("true"));
        }
        
        variables.push({
          name: match[2],
          value: value,
          type: type,
          scope: callStack.length > 0 ? callStack[callStack.length - 1].replace("()", "") : "global"
        });
      }
    }
    
    // Function call detection
    if (lines[i].content.match(/\b([a-zA-Z_]\w*)\s*\(/)) {
      const match = lines[i].content.match(/\b([a-zA-Z_]\w*)\s*\(/);
      if (match && match[1] && !match[1].match(/^(if|for|while|switch)$/)) {
        callStack.push(match[1] + "()");
      }
    }
    
    // Function end detection (very simplified)
    if (lines[i].content.match(/\breturn\b/) && callStack.length > 0) {
      callStack.pop();
    }
    
    executionStates.push({
      currentLine: i,
      variables: [...variables],
      callStack: [...callStack],
      consoleOutput: [] as ConsoleOutputItem[] // Explicitly typed as ConsoleOutputItem[]
    });
  }
  
  return { states: executionStates, totalSteps: executionStates.length };
}
