
import { ExecutionResult } from "./types";

// Create specific execution states for the multiplyAndLog example
export function enhanceMultiplyAndLogExample(code: string): ExecutionResult {
  // Parse the code to extract function parameters
  let a = 2, b = 4; // Default values
  
  try {
    const match = code.match(/multiplyAndLog\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (match) {
      a = parseInt(match[1]);
      b = parseInt(match[2]);
    }
  } catch (e) {
    console.error("Error parsing multiplyAndLog parameters:", e);
  }
  
  const result = a * b;
  
  // Create execution states for the multiplyAndLog example
  const states = [
    // Function declaration
    {
      currentLine: 0,
      variables: [],
      callStack: [],
      consoleOutput: []
    },
    
    // Function call
    {
      currentLine: 2,
      variables: [
        { name: "a", value: String(a), type: "number", scope: "global" },
        { name: "b", value: String(b), type: "number", scope: "global" }
      ],
      callStack: ["multiplyAndLog()"],
      consoleOutput: []
    },
    
    // Inside function - parameters initialized
    {
      currentLine: 0,
      variables: [
        { name: "a", value: String(a), type: "number", scope: "multiplyAndLog" },
        { name: "b", value: String(b), type: "number", scope: "multiplyAndLog" }
      ],
      callStack: ["multiplyAndLog()"],
      consoleOutput: []
    },
    
    // Inside function - calculate result
    {
      currentLine: 1,
      variables: [
        { name: "a", value: String(a), type: "number", scope: "multiplyAndLog" },
        { name: "b", value: String(b), type: "number", scope: "multiplyAndLog" },
        { name: "result", value: String(result), type: "number", scope: "multiplyAndLog" }
      ],
      callStack: ["multiplyAndLog()"],
      consoleOutput: []
    },
    
    // Return statement
    {
      currentLine: 2,
      variables: [
        { name: "a", value: String(a), type: "number", scope: "multiplyAndLog" },
        { name: "b", value: String(b), type: "number", scope: "multiplyAndLog" },
        { name: "result", value: String(result), type: "number", scope: "multiplyAndLog" }
      ],
      callStack: ["multiplyAndLog()"],
      consoleOutput: []
    },
    
    // After function call - assign result to final
    {
      currentLine: 3,
      variables: [
        { name: "final", value: String(result), type: "number", scope: "global" }
      ],
      callStack: [],
      consoleOutput: []
    }
  ];
  
  return { states, totalSteps: states.length };
}

// Enhanced factorial example
export function enhanceFactorialExample(): any[] {
  return [
    // Function definition
    {
      currentLine: 0,
      variables: [],
      callStack: [],
      consoleOutput: []
    },
    
    // Calling factorial(5) - initial call
    {
      currentLine: 6,
      variables: [],
      callStack: ["factorial(5)"],
      consoleOutput: []
    },
    
    // Inside factorial(5)
    {
      currentLine: 1,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)"],
      consoleOutput: []
    },
    
    // Check condition and call factorial(4)
    {
      currentLine: 2,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)"],
      consoleOutput: []
    },
    
    // Inside factorial(4)
    {
      currentLine: 1,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "n", value: "4", type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)"],
      consoleOutput: []
    },
    
    // Check condition and call factorial(3)
    {
      currentLine: 2,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "n", value: "4", type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)"],
      consoleOutput: []
    },
    
    // Inside factorial(3)
    {
      currentLine: 1,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "n", value: "4", type: "number", scope: "factorial" },
        { name: "n", value: "3", type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)"],
      consoleOutput: []
    },
    
    // Check condition and call factorial(2)
    {
      currentLine: 2,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "n", value: "4", type: "number", scope: "factorial" },
        { name: "n", value: "3", type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)"],
      consoleOutput: []
    },
    
    // Inside factorial(2)
    {
      currentLine: 1,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "n", value: "4", type: "number", scope: "factorial" },
        { name: "n", value: "3", type: "number", scope: "factorial" },
        { name: "n", value: "2", type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)"],
      consoleOutput: []
    },
    
    // Check condition and call factorial(1)
    {
      currentLine: 2,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "n", value: "4", type: "number", scope: "factorial" },
        { name: "n", value: "3", type: "number", scope: "factorial" },
        { name: "n", value: "2", type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)", "factorial(1)"],
      consoleOutput: []
    },
    
    // Inside factorial(1)
    {
      currentLine: 1,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "n", value: "4", type: "number", scope: "factorial" },
        { name: "n", value: "3", type: "number", scope: "factorial" },
        { name: "n", value: "2", type: "number", scope: "factorial" },
        { name: "n", value: "1", type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)", "factorial(1)"],
      consoleOutput: []
    },
    
    // Base case reached - factorial(1) = 1
    {
      currentLine: 1,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "n", value: "4", type: "number", scope: "factorial" },
        { name: "n", value: "3", type: "number", scope: "factorial" },
        { name: "n", value: "2", type: "number", scope: "factorial" },
        { name: "n", value: "1", type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)", "factorial(1)"],
      consoleOutput: []
    },
    
    // Return from factorial(1) with value 1
    {
      currentLine: 1,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "n", value: "4", type: "number", scope: "factorial" },
        { name: "n", value: "3", type: "number", scope: "factorial" },
        { name: "n", value: "2", type: "number", scope: "factorial" },
        { name: "return value", value: "1", type: "number", scope: "factorial(1)" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)"],
      consoleOutput: []
    },
    
    // Return from factorial(2) with value 2
    {
      currentLine: 2,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "n", value: "4", type: "number", scope: "factorial" },
        { name: "n", value: "3", type: "number", scope: "factorial" },
        { name: "return value", value: "2", type: "number", scope: "factorial(2)" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)"],
      consoleOutput: []
    },
    
    // Return from factorial(3) with value 6
    {
      currentLine: 2,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "n", value: "4", type: "number", scope: "factorial" },
        { name: "return value", value: "6", type: "number", scope: "factorial(3)" }
      ],
      callStack: ["factorial(5)", "factorial(4)"],
      consoleOutput: []
    },
    
    // Return from factorial(4) with value 24
    {
      currentLine: 2,
      variables: [
        { name: "n", value: "5", type: "number", scope: "factorial" },
        { name: "return value", value: "24", type: "number", scope: "factorial(4)" }
      ],
      callStack: ["factorial(5)"],
      consoleOutput: []
    },
    
    // Return from factorial(5) with value 120
    {
      currentLine: 2,
      variables: [
        { name: "return value", value: "120", type: "number", scope: "factorial(5)" }
      ],
      callStack: [],
      consoleOutput: []
    },
    
    // Set result and output to console
    {
      currentLine: 6,
      variables: [
        { name: "result", value: "120", type: "number", scope: "global" }
      ],
      callStack: [],
      consoleOutput: []
    },
    
    // Console.log
    {
      currentLine: 7,
      variables: [
        { name: "result", value: "120", type: "number", scope: "global" }
      ],
      callStack: [],
      consoleOutput: [
        { type: "log", content: "Factorial result: 120", timestamp: new Date() }
      ]
    }
  ];
}
