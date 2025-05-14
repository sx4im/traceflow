
import { ScopeContext, Variable } from "./types";

// Helper function to flatten all variables from all scopes
export function getCurrentVariables(scopeStack: ScopeContext[]): Variable[] {
  const variables: Variable[] = [];
  for (const scope of scopeStack) {
    for (const varName in scope.variables) {
      variables.push(scope.variables[varName]);
    }
  }
  return variables;
}

// Helper function to simulate factorial calculation
export function simulateFactorial(n: number): number {
  if (n <= 1) return 1;
  return n * simulateFactorial(n - 1);
}

// Convert any value to string for display consistency
export function valueToString(value: any): string {
  if (typeof value === 'string') {
    return value;
  }
  return String(value);
}