
// Update the import path to the new module structure
import { generateExecutionStates } from "./codeParser";

// In a real implementation, this would execute code in a sandbox (iframe or Web Worker)
// and collect execution state after each step
export const executeSandboxed = (code: string) => {
  console.log("Executing code in sandbox");
  
  try {
    // For demo purposes, we'll use our enhanced implementation
    // to generate execution states with accurate variable tracking
    const { states, totalSteps } = generateExecutionStates(code);
    
    // Process states to ensure consistency
    const processedStates = states.map(state => ({
      ...state,
      variables: state.variables.map(v => ({
        ...v,
        // Ensure type is accurate - in a real implementation this would come from runtime
        type: v.type || typeof v.value,
        // Ensure scope is set
        scope: v.scope || "global"
      }))
    }));
    
    return { states: processedStates, totalSteps: processedStates.length };
  } catch (error) {
    console.error("Sandbox execution error:", error);
    throw new Error(`Failed to execute code: ${error instanceof Error ? error.message : String(error)}`);
  }
};
