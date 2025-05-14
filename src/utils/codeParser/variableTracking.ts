
import * as t from "@babel/types";
import { ScopeContext, Variable } from "./types";
import { simulateFactorial, valueToString } from "./utils";

// Process variable declarations and track their values
export const processVariableDeclaration = (
  path: any, 
  scopeStack: ScopeContext[], 
  currentScope: string
): Variable | null => {
  if (!path.node.declarations || path.node.declarations.length === 0) return null;
  
  const decl = path.node.declarations[0];
  if (!t.isIdentifier(decl.id)) return null;
  
  const varName = decl.id.name;
  let varValue: any = undefined;
  let varType = "undefined";
  
  // Simulate evaluation of common patterns
  if (decl.init) {
    if (t.isNumericLiteral(decl.init)) {
      varValue = String(decl.init.value);
      varType = "number";
    } else if (t.isStringLiteral(decl.init)) {
      varValue = decl.init.value;
      varType = "string";
    } else if (t.isBooleanLiteral(decl.init)) {
      varValue = String(decl.init.value);
      varType = "boolean";
    } else if (t.isCallExpression(decl.init)) {
      // Try to determine the function and its return value
      const calleeName = t.isIdentifier(decl.init.callee) ? decl.init.callee.name : "unknown";
      
      // For the factorial example, simulate the return value
      if (calleeName === "factorial" && decl.init.arguments.length > 0) {
        if (t.isNumericLiteral(decl.init.arguments[0])) {
          const arg = decl.init.arguments[0].value;
          varValue = String(simulateFactorial(arg));
          varType = "number";
        }
      } else if (calleeName === "multiplyAndLog" && decl.init.arguments.length > 1) {
        // Handle the multiplyAndLog example
        if (t.isNumericLiteral(decl.init.arguments[0]) && t.isNumericLiteral(decl.init.arguments[1])) {
          varValue = String(decl.init.arguments[0].value * decl.init.arguments[1].value);
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
          if (leftName in scope.variables && leftValue === undefined) {
            leftValue = scope.variables[leftName].value;
          }
          if (rightName in scope.variables && rightValue === undefined) {
            rightValue = scope.variables[rightName].value;
          }
        }
        
        // If both values are numbers, perform the multiplication
        const leftNum = parseFloat(String(leftValue));
        const rightNum = parseFloat(String(rightValue));
        
        if (!isNaN(leftNum) && !isNaN(rightNum)) {
          varValue = String(leftNum * rightNum);
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
  }
  
  // Create the variable object
  const variable: Variable = {
    name: varName,
    value: valueToString(varValue),
    type: varType,
    scope: currentScope
  };
  
  // Store in current scope
  scopeStack[scopeStack.length - 1].variables[varName] = variable;
  
  return variable;
};

// Process function arguments for a function call
export const processFunctionArguments = (
  args: any[], 
  scopeStack: ScopeContext[], 
  functionScope: string
): Variable[] => {
  const variables: Variable[] = [];
  
  args.forEach((arg, index) => {
    if (t.isIdentifier(arg) || t.isLiteral(arg)) {
      let paramName = `arg${index}`;
      let paramValue: any;
      let paramType: string;
      
      // For simple literals, we can extract values
      if (t.isNumericLiteral(arg)) {
        paramValue = String(arg.value); 
        paramType = "number";
      } else if (t.isStringLiteral(arg)) {
        paramValue = arg.value;
        paramType = "string";
      } else if (t.isBooleanLiteral(arg)) {
        paramValue = String(arg.value);
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
      
      // Create variable and add to function scope
      const variable: Variable = {
        name: paramName,
        value: valueToString(paramValue),
        type: paramType,
        scope: functionScope
      };
      
      variables.push(variable);
      
      // Store in function scope
      scopeStack[scopeStack.length - 1].variables[paramName] = variable;
    }
  });
  
  return variables;
};

// Process console.log arguments for output
export const processConsoleLogArguments = (args: any[], scopeStack: ScopeContext[]): string[] => {
  return args.map(arg => {
    if (t.isStringLiteral(arg)) return arg.value;
    if (t.isNumericLiteral(arg)) {
      return String(arg.value);
    }
    if (t.isBooleanLiteral(arg)) {
      return String(arg.value);
    }
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
};