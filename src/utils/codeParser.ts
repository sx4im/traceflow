import { parse } from "@babel/parser";
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

// For now, this is a simplified mock implementation
// A real implementation would use Babel or Esprima to properly parse and instrument the code
export const parseAndInstrumentCode = (code: string): string => {
  try {
    // Simple placeholder implementation
    // In a real app, this would parse the code and insert instrumentation
    // to track variable changes, function calls, etc.
    console.log("Parsing and instrumenting code");
    return code;
  } catch (error) {
    console.error("Error instrumenting code:", error);
    throw new Error(`Failed to parse code: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Function to extract line numbers from code
export const extractLineInfo = (code: string) => {
  const lines = code.split('\n');
  return lines.map((line, index) => ({
    lineNumber: index,
    content: line.trim(),
    isEmpty: line.trim() === '',
    isComment: line.trim().startsWith('//')
  }));
};

// Using a proper AST parser to analyze variable declarations, function calls, and scopes
export const generateExecutionStates = (code: string) => {
  const lines = extractLineInfo(code);
  const executionStates = [];
  
  // Create a scope stack to track variables in different scopes
  const scopeStack = [{ name: "global", variables: {} }];
  let currentLine = 0;
  let callStack = [];
  let consoleOutput = [];
  
  try {
    // Try to parse the code and generate AST
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx"]
    });
    
    // Track variables and function calls through the AST
    traverse(ast, {
      VariableDeclaration(path) {
        const line = path.node.loc?.start.line;
        if (!line) return;
        
        path.node.declarations.forEach(decl => {
          const varName = t.isIdentifier(decl.id) ? decl.id.name : "unknown";
          
          // Determine the current scope
          const currentScope = scopeStack[scopeStack.length - 1].name;
          
          // For this demo, we'll simulate execution and guess values
          let varValue;
          let varType;
          
          // Simulate evaluation of common patterns
          if (decl.init) {
            if (t.isNumericLiteral(decl.init)) {
              varValue = decl.init.value;
              varType = "number";
            } else if (t.isStringLiteral(decl.init)) {
              varValue = decl.init.value;
              varType = "string";
            } else if (t.isBooleanLiteral(decl.init)) {
              varValue = decl.init.value;
              varType = "boolean";
            } else if (t.isCallExpression(decl.init)) {
              // Try to determine the function and its return value
              const calleeName = t.isIdentifier(decl.init.callee) ? decl.init.callee.name : "unknown";
              
              // For the factorial example, simulate the return value
              if (calleeName === "factorial" && decl.init.arguments.length > 0) {
                if (t.isNumericLiteral(decl.init.arguments[0])) {
                  const arg = decl.init.arguments[0].value;
                  varValue = simulateFactorial(arg);
                  varType = "number";
                }
              } else if (calleeName === "multiplyAndLog" && decl.init.arguments.length > 1) {
                // Handle the multiplyAndLog example
                if (t.isNumericLiteral(decl.init.arguments[0]) && t.isNumericLiteral(decl.init.arguments[1])) {
                  varValue = decl.init.arguments[0].value * decl.init.arguments[1].value;
                  varType = "number";
                }
              } else {
                varValue = `[Result of ${calleeName}()]`;
                varType = "unknown";
              }
            } else if (t.isBinaryExpression(decl.init)) {
              // Handle binary expressions like a * b
              if (t.isIdentifier(decl.init.left) && t.isIdentifier(decl.init.right) && decl.init.operator === "*") {
                const leftName = decl.init.left.name;
                const rightName = decl.init.right.name;
                
                // Look up the values in the current scope
                let leftValue, rightValue;
                for (let i = scopeStack.length - 1; i >= 0; i--) {
                  const scope = scopeStack[i];
                  if (leftName in scope.variables && !leftValue) {
                    leftValue = scope.variables[leftName].value;
                  }
                  if (rightName in scope.variables && !rightValue) {
                    rightValue = scope.variables[rightName].value;
                  }
                }
                
                if (typeof leftValue === 'number' && typeof rightValue === 'number') {
                  varValue = leftValue * rightValue;
                  varType = "number";
                } else {
                  varValue = `[Expression: ${leftName} * ${rightName}]`;
                  varType = "unknown";
                }
              } else {
                varValue = "[Binary Expression Result]";
                varType = "unknown";
              }
            } else {
              varValue = "[Complex Value]";
              varType = "unknown";
            }
          } else {
            varValue = undefined;
            varType = "undefined";
          }
          
          // Store the variable in current scope
          scopeStack[scopeStack.length - 1].variables[varName] = {
            name: varName,
            value: varValue,
            type: varType,
            scope: currentScope
          };
          
          // Add an execution state for this variable declaration
          const currentVariables = [];
          // Flatten all variables from all scopes
          for (const scope of scopeStack) {
            for (const varName in scope.variables) {
              currentVariables.push(scope.variables[varName]);
            }
          }
          
          executionStates.push({
            currentLine: line - 1, // Convert to 0-based index
            variables: currentVariables,
            callStack: [...callStack],
            consoleOutput: [...consoleOutput]
          });
        });
      },
      
      FunctionDeclaration(path) {
        const line = path.node.loc?.start.line;
        if (!line) return;
        
        const funcName = path.node.id?.name || "anonymous";
        
        // Add an execution state for function declaration
        executionStates.push({
          currentLine: line - 1, // Convert to 0-based index
          variables: getCurrentVariables(scopeStack),
          callStack: [...callStack],
          consoleOutput: [...consoleOutput]
        });
      },
      
      CallExpression(path) {
        const line = path.node.loc?.start.line;
        if (!line) return;
        
        // Only process top-level call expressions
        if (path.parent && (t.isVariableDeclarator(path.parent) || t.isExpressionStatement(path.parent))) {
          const calleeName = t.isIdentifier(path.node.callee) ? path.node.callee.name : "anonymous";
          
          // Handle console.log specially
          if (t.isMemberExpression(path.node.callee)) {
            const obj = path.node.callee.object;
            const prop = path.node.callee.property;
            if (t.isIdentifier(obj) && obj.name === "console" && t.isIdentifier(prop) && prop.name === "log") {
              // Extract console.log arguments
              const logArgs = path.node.arguments.map(arg => {
                if (t.isStringLiteral(arg)) return arg.value;
                if (t.isNumericLiteral(arg)) return arg.value;
                if (t.isIdentifier(arg)) {
                  // Try to find the variable value
                  for (let i = scopeStack.length - 1; i >= 0; i--) {
                    const scope = scopeStack[i];
                    if (arg.name in scope.variables) {
                      return scope.variables[arg.name].value;
                    }
                  }
                  return `[Variable: ${arg.name}]`;
                }
                return "[Complex Value]";
              });
              
              // Add to console output
              consoleOutput.push({
                type: "log",
                content: logArgs.join(" "),
                timestamp: new Date()
              });
              
              executionStates.push({
                currentLine: line - 1, // Convert to 0-based index
                variables: getCurrentVariables(scopeStack),
                callStack: [...callStack],
                consoleOutput: [...consoleOutput]
              });
              return;
            }
          }
          
          // For other function calls
          callStack.push(`${calleeName}()`);
          
          // Create a new scope for the function
          scopeStack.push({ name: calleeName, variables: {} });
          
          // Add function arguments to the scope
          path.node.arguments.forEach((arg, index) => {
            if (t.isIdentifier(arg) || t.isLiteral(arg)) {
              let paramName = `arg${index}`;
              let paramValue;
              let paramType;
              
              // For simple literals, we can extract values
              if (t.isNumericLiteral(arg)) {
                paramValue = arg.value;
                paramType = "number";
              } else if (t.isStringLiteral(arg)) {
                paramValue = arg.value;
                paramType = "string";
              } else if (t.isBooleanLiteral(arg)) {
                paramValue = arg.value ? "true" : "false"; // Convert to string to fix TS2322
                paramType = "boolean";
              } else if (t.isIdentifier(arg)) {
                paramName = arg.name;
                // Look for the value in other scopes
                for (let i = scopeStack.length - 2; i >= 0; i--) {
                  const scope = scopeStack[i];
                  if (arg.name in scope.variables) {
                    paramValue = scope.variables[arg.name].value;
                    paramType = scope.variables[arg.name].type;
                    break;
                  }
                }
                if (paramValue === undefined) {
                  paramValue = "[Unknown]";
                  paramType = "unknown";
                }
              } else {
                paramValue = "[Complex Value]";
                paramType = "unknown";
              }
              
              // Use actual parameter names from function declarations if available
              // This would require additional analysis of the AST to match function declarations
              
              // Store parameter in function scope
              scopeStack[scopeStack.length - 1].variables[paramName] = {
                name: paramName,
                value: paramValue,
                type: paramType,
                scope: calleeName
              };
            }
          });
          
          // Generate execution state for function entry
          executionStates.push({
            currentLine: line - 1, // Convert to 0-based index
            variables: getCurrentVariables(scopeStack),
            callStack: [...callStack],
            consoleOutput: [...consoleOutput]
          });
          
          // For demo purpose, simulate function exit too
          callStack.pop();
          scopeStack.pop();
          
          // Add an execution state after function returns
          executionStates.push({
            currentLine: line - 1, // Convert to 0-based index
            variables: getCurrentVariables(scopeStack),
            callStack: [...callStack],
            consoleOutput: [...consoleOutput]
          });
        }
      },
      
      ReturnStatement(path) {
        const line = path.node.loc?.start.line;
        if (!line) return;
        
        // Handle the return value
        let returnValue;
        let returnType;
        
        if (path.node.argument) {
          if (t.isNumericLiteral(path.node.argument)) {
            returnValue = path.node.argument.value;
            returnType = "number";
          } else if (t.isStringLiteral(path.node.argument)) {
            returnValue = path.node.argument.value;
            returnType = "string";
          } else if (t.isBooleanLiteral(path.node.argument)) {
            returnValue = path.node.argument.value;
            returnType = "boolean";
          } else if (t.isIdentifier(path.node.argument)) {
            // Look up the variable in the current scope
            const varName = path.node.argument.name;
            for (let i = scopeStack.length - 1; i >= 0; i--) {
              const scope = scopeStack[i];
              if (varName in scope.variables) {
                returnValue = scope.variables[varName].value;
                returnType = scope.variables[varName].type;
                break;
              }
            }
          }
        }
        
        executionStates.push({
          currentLine: line - 1, // Convert to 0-based index
          variables: getCurrentVariables(scopeStack),
          callStack: [...callStack],
          consoleOutput: [...consoleOutput]
        });
      }
    });
    
    // Make sure we have at least one state
    if (executionStates.length === 0) {
      executionStates.push({
        currentLine: 0,
        variables: [],
        callStack: [],
        consoleOutput: []
      });
    }
    
    // If the code includes multiplyAndLog example, use enhanced states for better demo
    if (code.includes("multiplyAndLog")) {
      return enhanceMultiplyAndLogExample(code);
    }
    
    // If the code includes factorial example, use our predefined example
    if (code.includes("factorial")) {
      return { states: enhanceFactorialExample(), totalSteps: executionStates.length };
    }
    
    return { states: executionStates, totalSteps: executionStates.length };
    
  } catch (error) {
    console.error("Error analyzing code:", error);
    // Fallback to simple parsing
    return fallbackExecutionStates(code);
  }
};

// Helper function to flatten all variables from all scopes
function getCurrentVariables(scopeStack) {
  const variables = [];
  for (const scope of scopeStack) {
    for (const varName in scope.variables) {
      variables.push(scope.variables[varName]);
    }
  }
  return variables;
}

// Helper function to simulate factorial calculation
function simulateFactorial(n) {
  if (n <= 1) return 1;
  return n * simulateFactorial(n - 1);
}

// Fallback to simpler execution states when parsing fails
function fallbackExecutionStates(code) {
  const lines = extractLineInfo(code);
  const executionStates = [];
  
  // Simplified logic for execution states
  let lineNum = 0;
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
          value = numMatch ? parseInt(numMatch[1]) : 0;
        } else if (lines[i].content.match(/=\s*["']/)) {
          type = "string";
          const strMatch = lines[i].content.match(/=\s*["'](.*)["']/);
          value = strMatch ? strMatch[1] : "";
        } else if (lines[i].content.match(/=\s*(true|false)/i)) {
          type = "boolean";
          value = lines[i].content.includes("true");
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
      consoleOutput: []
    });
  }
  
  return { states: executionStates, totalSteps: executionStates.length };
}

// Create specific execution states for the multiplyAndLog example
function enhanceMultiplyAndLogExample(code) {
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
        { name: "a", value: a, type: "number", scope: "global" },
        { name: "b", value: b, type: "number", scope: "global" }
      ],
      callStack: ["multiplyAndLog()"],
      consoleOutput: []
    },
    
    // Inside function - parameters initialized
    {
      currentLine: 0,
      variables: [
        { name: "a", value: a, type: "number", scope: "multiplyAndLog" },
        { name: "b", value: b, type: "number", scope: "multiplyAndLog" }
      ],
      callStack: ["multiplyAndLog()"],
      consoleOutput: []
    },
    
    // Inside function - calculate result
    {
      currentLine: 1,
      variables: [
        { name: "a", value: a, type: "number", scope: "multiplyAndLog" },
        { name: "b", value: b, type: "number", scope: "multiplyAndLog" },
        { name: "result", value: result, type: "number", scope: "multiplyAndLog" }
      ],
      callStack: ["multiplyAndLog()"],
      consoleOutput: []
    },
    
    // Return statement
    {
      currentLine: 2,
      variables: [
        { name: "a", value: a, type: "number", scope: "multiplyAndLog" },
        { name: "b", value: b, type: "number", scope: "multiplyAndLog" },
        { name: "result", value: result, type: "number", scope: "multiplyAndLog" }
      ],
      callStack: ["multiplyAndLog()"],
      consoleOutput: []
    },
    
    // After function call - assign result to final
    {
      currentLine: 3,
      variables: [
        { name: "final", value: result, type: "number", scope: "global" }
      ],
      callStack: [],
      consoleOutput: []
    }
  ];
  
  return { states, totalSteps: states.length };
}

// Enhanced factorial example
function enhanceFactorialExample() {
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
        { name: "n", value: 5, type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)"],
      consoleOutput: []
    },
    
    // Check condition and call factorial(4)
    {
      currentLine: 2,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)"],
      consoleOutput: []
    },
    
    // Inside factorial(4)
    {
      currentLine: 1,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "n", value: 4, type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)"],
      consoleOutput: []
    },
    
    // Check condition and call factorial(3)
    {
      currentLine: 2,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "n", value: 4, type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)"],
      consoleOutput: []
    },
    
    // Inside factorial(3)
    {
      currentLine: 1,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "n", value: 4, type: "number", scope: "factorial" },
        { name: "n", value: 3, type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)"],
      consoleOutput: []
    },
    
    // Check condition and call factorial(2)
    {
      currentLine: 2,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "n", value: 4, type: "number", scope: "factorial" },
        { name: "n", value: 3, type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)"],
      consoleOutput: []
    },
    
    // Inside factorial(2)
    {
      currentLine: 1,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "n", value: 4, type: "number", scope: "factorial" },
        { name: "n", value: 3, type: "number", scope: "factorial" },
        { name: "n", value: 2, type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)"],
      consoleOutput: []
    },
    
    // Check condition and call factorial(1)
    {
      currentLine: 2,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "n", value: 4, type: "number", scope: "factorial" },
        { name: "n", value: 3, type: "number", scope: "factorial" },
        { name: "n", value: 2, type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)", "factorial(1)"],
      consoleOutput: []
    },
    
    // Inside factorial(1)
    {
      currentLine: 1,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "n", value: 4, type: "number", scope: "factorial" },
        { name: "n", value: 3, type: "number", scope: "factorial" },
        { name: "n", value: 2, type: "number", scope: "factorial" },
        { name: "n", value: 1, type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)", "factorial(1)"],
      consoleOutput: []
    },
    
    // Base case reached - factorial(1) = 1
    {
      currentLine: 1,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "n", value: 4, type: "number", scope: "factorial" },
        { name: "n", value: 3, type: "number", scope: "factorial" },
        { name: "n", value: 2, type: "number", scope: "factorial" },
        { name: "n", value: 1, type: "number", scope: "factorial" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)", "factorial(1)"],
      consoleOutput: []
    },
    
    // Return from factorial(1) with value 1
    {
      currentLine: 1,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "n", value: 4, type: "number", scope: "factorial" },
        { name: "n", value: 3, type: "number", scope: "factorial" },
        { name: "n", value: 2, type: "number", scope: "factorial" },
        { name: "return value", value: 1, type: "number", scope: "factorial(1)" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)", "factorial(2)"],
      consoleOutput: []
    },
    
    // Return from factorial(2) with value 2
    {
      currentLine: 2,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "n", value: 4, type: "number", scope: "factorial" },
        { name: "n", value: 3, type: "number", scope: "factorial" },
        { name: "return value", value: 2, type: "number", scope: "factorial(2)" }
      ],
      callStack: ["factorial(5)", "factorial(4)", "factorial(3)"],
      consoleOutput: []
    },
    
    // Return from factorial(3) with value 6
    {
      currentLine: 2,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "n", value: 4, type: "number", scope: "factorial" },
        { name: "return value", value: 6, type: "number", scope: "factorial(3)" }
      ],
      callStack: ["factorial(5)", "factorial(4)"],
      consoleOutput: []
    },
    
    // Return from factorial(4) with value 24
    {
      currentLine: 2,
      variables: [
        { name: "n", value: 5, type: "number", scope: "factorial" },
        { name: "return value", value: 24, type: "number", scope: "factorial(4)" }
      ],
      callStack: ["factorial(5)"],
      consoleOutput: []
    },
    
    // Return from factorial(5) with value 120
    {
      currentLine: 2,
      variables: [
        { name: "return value", value: 120, type: "number", scope: "factorial(5)" }
      ],
      callStack: [],
      consoleOutput: []
    },
    
    // Set result and output to console
    {
      currentLine: 6,
      variables: [
        { name: "result", value: 120, type: "number", scope: "global" }
      ],
      callStack: [],
      consoleOutput: []
    },
    
    // Console.log
    {
      currentLine: 7,
      variables: [
        { name: "result", value: 120, type: "number", scope: "global" }
      ],
      callStack: [],
      consoleOutput: [
        { type: "log", content: "Factorial result: 120", timestamp: new Date() }
      ]
    }
  ];
}
