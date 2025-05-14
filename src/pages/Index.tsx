
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CodeEditor } from "@/components/CodeEditor";
import { ControlPanel } from "@/components/ControlPanel";
import { VariableDisplay } from "@/components/VariableDisplay";
import { ConsoleOutput } from "@/components/ConsoleOutput";
import { ExecutionVisualizer } from "@/components/ExecutionVisualizer";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { ThemeToggle } from "@/components/ThemeToggle";
import { withAnimation } from "@/utils/animations";

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

  // Demo animation on initial load with a longer delay to ensure stability
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-card shadow-sm border-b p-4 transition-colors z-10 relative">
        <div className="container mx-auto flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary opacity-100 visible z-10 relative">
              TraceFlow
            </h1>
            <p className="text-sm text-muted-foreground opacity-100 visible z-10 relative">
              Interactive JavaScript Debugger Simulator
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-6 transition-all overflow-visible">
        <div className={`grid grid-cols-1 lg:grid-cols-5 gap-6 ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
          {/* Code Editor Area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="overflow-visible h-auto">
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold mb-4 opacity-100 visible">Code Editor</h2>
                <CodeEditor
                  code={code}
                  onCodeChange={setCode}
                  currentLine={currentLine}
                />
              </CardContent>
            </Card>
            
            <Card className="overflow-visible h-auto">
              <CardContent className="p-5">
                <ControlPanel
                  onExecute={execute}
                  onStep={step}
                  onReset={reset}
                  isRunning={isRunning}
                  isPaused={isPaused}
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                />
              </CardContent>
            </Card>
            
            <Card className="overflow-visible h-auto">
              <CardContent className="p-5">
                <ConsoleOutput output={consoleOutput} />
              </CardContent>
            </Card>
          </div>
          
          {/* Visualization Area */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Tabs defaultValue="variables" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4 w-full">
                <TabsTrigger value="variables" className="z-10 relative">Variables</TabsTrigger>
                <TabsTrigger value="call-stack" className="z-10 relative">Call Stack</TabsTrigger>
                <TabsTrigger value="visualization" className="z-10 relative">Visualization</TabsTrigger>
              </TabsList>
              <Card className="overflow-visible h-auto">
                <CardContent className="p-5 overflow-visible">
                  <TabsContent value="variables" className="mt-0 overflow-visible">
                    <VariableDisplay variables={variables} />
                  </TabsContent>
                  <TabsContent value="call-stack" className="mt-0 overflow-visible">
                    <div className="min-h-[300px]">
                      <h3 className="font-medium mb-3">Call Stack</h3>
                      <div className="bg-muted/50 rounded-md border">
                        {callStack.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground italic">
                            Call stack empty
                          </div>
                        ) : (
                          <ul className="p-2 space-y-2">
                            {callStack.map((call, index) => (
                              <li 
                                key={index} 
                                className="p-3 bg-card rounded-md border font-mono text-sm"
                              >
                                {call}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="visualization" className="mt-0 overflow-visible">
                    <ExecutionVisualizer
                      callStack={callStack}
                      variables={variables}
                      currentLine={currentLine}
                    />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>
        </div>
      </main>
      
      <footer className="py-6 px-4 border-t transition-colors mt-6 z-0">
        <div className="container mx-auto text-sm text-center text-muted-foreground">
          <p>TraceFlow - Interactive JavaScript Debugger Simulator</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;