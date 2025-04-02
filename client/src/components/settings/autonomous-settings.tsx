import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { autonomousOperator, AutonomousMode } from '@/lib/autonomous';

export default function AutonomousSettings() {
  const [mode, setMode] = useState<AutonomousMode>(AutonomousMode.DISABLED);
  const [diagnostic, setDiagnostic] = useState<{
    success: boolean;
    servers: number;
    apps: number;
    activities: number;
    issues: string[];
  } | null>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  
  // Initialize from the autonomous operator
  useEffect(() => {
    setMode(autonomousOperator.getMode());
  }, []);
  
  // Update mode in the autonomous operator when it changes
  const handleModeChange = (newMode: AutonomousMode) => {
    setMode(newMode);
    autonomousOperator.setMode(newMode);
  };
  
  // Run diagnostic
  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const result = await autonomousOperator.runDiagnostic();
      setDiagnostic(result);
    } catch (error) {
      console.error('Failed to run diagnostic:', error);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Autonomous Operations</CardTitle>
        <CardDescription>
          Configure autonomous monitoring and self-healing capabilities for the MCP manager.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="autonomous-mode" className="text-base">Enable Autonomous Mode</Label>
            <Switch
              id="autonomous-mode"
              checked={mode !== AutonomousMode.DISABLED}
              onCheckedChange={(checked) => 
                handleModeChange(checked ? AutonomousMode.MONITORING : AutonomousMode.DISABLED)
              }
            />
          </div>
          
          {mode !== AutonomousMode.DISABLED && (
            <RadioGroup 
              value={mode} 
              onValueChange={(value) => handleModeChange(value as AutonomousMode)}
              className="mt-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={AutonomousMode.MONITORING} id="monitoring" />
                <Label htmlFor="monitoring">Monitoring Only</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value={AutonomousMode.FULL_AUTOMATION} id="full-automation" />
                <Label htmlFor="full-automation">Full Automation</Label>
              </div>
            </RadioGroup>
          )}
          
          {mode !== AutonomousMode.DISABLED && (
            <div className="text-sm text-muted-foreground mt-2">
              {mode === AutonomousMode.MONITORING ? (
                'Monitoring mode will detect issues but will not make any automatic changes.'
              ) : (
                'Full automation mode will detect issues and attempt to fix them automatically.'
              )}
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t">
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunningDiagnostic}
            className="w-full"
          >
            {isRunningDiagnostic ? 'Running Diagnostic...' : 'Run System Diagnostic'}
          </Button>
        </div>
        
        {diagnostic && (
          <Alert variant={diagnostic.success ? "default" : "destructive"} className="mt-4">
            {diagnostic.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {diagnostic.success ? 'System Healthy' : 'Issues Detected'}
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <p>Servers: {diagnostic.servers}</p>
                <p>Applications: {diagnostic.apps}</p>
                <p>Recent Activities: {diagnostic.activities}</p>
                
                {diagnostic.issues.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Issues:</p>
                    <ul className="list-disc pl-5 mt-1">
                      {diagnostic.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between bg-muted/50 p-4 text-sm text-muted-foreground">
        <div>Autonomous operations help maintain system health without manual intervention.</div>
      </CardFooter>
    </Card>
  );
}