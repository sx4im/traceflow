
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor } from "@/components/CodeEditor";
import { ControlPanel } from "@/components/ControlPanel";
import { VariableDisplay } from "@/components/VariableDisplay";
import { ConsoleOutput } from "@/components/ConsoleOutput";
import { ExecutionVisualizer } from "@/components/ExecutionVisualizer";
import { useCodeExecution } from "@/hooks/useCodeExecution";

const DEFAULT_CODE = `// Try a simple function example
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// Calculate factorial of 5
const result = factorial(5);
console.log("Factorial result:", result);
`;

const Index = () => {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  
  const {
    execute,
    step,
    reset,
    isRunning,
    isPaused,
    currentStep,
    totalSteps,
    variables,
    consoleOutput,
    currentLine,
    callStack
  } = useCodeExecution(code);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            TraceFlow
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Interactive JavaScript Debugger Simulator
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Code Editor Area */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-2">Code Editor</h2>
              <CodeEditor
                code={code}
                onCodeChange={setCode}
                currentLine={currentLine}
              />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <ControlPanel
                onExecute={execute}
                onStep={step}
                onReset={reset}
                isRunning={isRunning}
                isPaused={isPaused}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <ConsoleOutput output={consoleOutput} />
            </div>
          </div>
          
          {/* Visualization Area */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <Tabs defaultValue="variables" className="w-full">
              <TabsList className="grid grid-cols-3 mb-2">
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="call-stack">Call Stack</TabsTrigger>
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
              </TabsList>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <TabsContent value="variables">
                  <VariableDisplay variables={variables} />
                </TabsContent>
                <TabsContent value="call-stack">
                  <div className="min-h-[300px]">
                    <h3 className="font-medium mb-2">Call Stack</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                      {callStack.length === 0 ? (
                        <p className="text-gray-500 italic">Call stack empty</p>
                      ) : (
                        <ul className="space-y-1">
                          {callStack.map((call, index) => (
                            <li 
                              key={index} 
                              className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm"
                            >
                              {call}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="visualization">
                  <ExecutionVisualizer
                    callStack={callStack}
                    variables={variables}
                    currentLine={currentLine}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 shadow-sm p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto text-sm text-center text-gray-500 dark:text-gray-400">
          TraceFlow - Interactive JavaScript Debugger Simulator
        </div>
      </footer>
    </div>
  );
};

export default Index;