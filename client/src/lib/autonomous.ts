/**
 * Autonomous operations utilities for MCP Manager
 * 
 * This module provides functions for autonomous operation and testing
 * of the MCP manager without requiring human interaction.
 */

import { performHeadlessOperation } from './mcp';
import { Server, App, Activity } from './types';

/**
 * Autonomous operation modes
 */
export enum AutonomousMode {
  DISABLED = 'disabled',
  MONITORING = 'monitoring',
  FULL_AUTOMATION = 'full_automation'
}

/**
 * Class for autonomous MCP manager operations
 */
export class AutonomousOperator {
  private mode: AutonomousMode = AutonomousMode.DISABLED;
  private monitoringInterval: number | null = null;
  private healthCheckInterval: number | null = null;
  
  /**
   * Initialize the autonomous operator
   */
  constructor(initialMode: AutonomousMode = AutonomousMode.DISABLED) {
    this.mode = initialMode;
    
    // Start monitoring if enabled
    if (this.mode !== AutonomousMode.DISABLED) {
      this.startMonitoring();
    }
  }
  
  /**
   * Set the autonomous mode
   */
  setMode(mode: AutonomousMode): void {
    const previousMode = this.mode;
    this.mode = mode;
    
    // Handle mode transition
    if (previousMode === AutonomousMode.DISABLED && mode !== AutonomousMode.DISABLED) {
      this.startMonitoring();
    } else if (previousMode !== AutonomousMode.DISABLED && mode === AutonomousMode.DISABLED) {
      this.stopMonitoring();
    }
    
    console.log(`Autonomous mode changed from ${previousMode} to ${mode}`);
  }
  
  /**
   * Get the current autonomous mode
   */
  getMode(): AutonomousMode {
    return this.mode;
  }
  
  /**
   * Start monitoring servers
   */
  private startMonitoring(): void {
    if (this.monitoringInterval !== null) {
      clearInterval(this.monitoringInterval);
    }
    
    // Set up health check interval
    this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Check health every 30 seconds
    
    // Set up monitoring interval
    this.monitoringInterval = window.setInterval(() => {
      this.performMonitoring();
    }, 60000); // Monitor every minute
    
    // Perform initial checks
    this.performHealthCheck();
    this.performMonitoring();
    
    console.log('Autonomous monitoring started');
  }
  
  /**
   * Stop monitoring
   */
  private stopMonitoring(): void {
    if (this.monitoringInterval !== null) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.healthCheckInterval !== null) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    console.log('Autonomous monitoring stopped');
  }
  
  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      console.log('Health check:', data);
      
      if (data.status !== 'ok') {
        console.error('Health check failed:', data);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }
  
  /**
   * Perform monitoring of servers
   */
  private async performMonitoring(): Promise<void> {
    if (this.mode === AutonomousMode.DISABLED) {
      return;
    }
    
    try {
      // Get all servers
      const response = await fetch('/api/servers');
      const servers = await response.json() as Server[];
      
      console.log(`Monitoring ${servers.length} servers`);
      
      // Check for warning or error status
      const problemServers = servers.filter(s => 
        s.status === 'warning' || s.status === 'error'
      );
      
      if (problemServers.length > 0) {
        console.warn('Detected servers with issues:', problemServers);
        
        // In full automation mode, attempt to fix issues
        if (this.mode === AutonomousMode.FULL_AUTOMATION) {
          await this.attemptAutoRepair(problemServers);
        }
      }
      
      // In full automation mode, ensure at least one worker is active
      if (this.mode === AutonomousMode.FULL_AUTOMATION) {
        const workers = servers.filter(s => s.isWorker);
        
        if (workers.length === 0) {
          console.log('No active workers found. Enabling worker mode on a server...');
          
          // Find a suitable server to make a worker
          const eligibleServer = servers.find(s => s.status === 'active');
          
          if (eligibleServer) {
            await performHeadlessOperation('toggle_worker', eligibleServer.id);
            console.log(`Enabled worker mode on server ${eligibleServer.id}`);
          }
        }
      }
    } catch (error) {
      console.error('Monitoring failed:', error);
    }
  }
  
  /**
   * Attempt to automatically repair problem servers
   */
  private async attemptAutoRepair(problemServers: Server[]): Promise<void> {
    for (const server of problemServers) {
      console.log(`Attempting to repair server ${server.id}`);
      
      try {
        // For now, just try a sync operation to refresh server state
        await performHeadlessOperation('sync_all');
        console.log(`Repair attempt complete for server ${server.id}`);
      } catch (error) {
        console.error(`Failed to repair server ${server.id}:`, error);
      }
    }
  }
  
  /**
   * Run a diagnostic check of all system components
   */
  async runDiagnostic(): Promise<{
    success: boolean;
    servers: number;
    apps: number;
    activities: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    let serverCount = 0;
    let appCount = 0;
    let activityCount = 0;
    
    try {
      // Check servers
      const serversResponse = await fetch('/api/servers');
      const servers = await serversResponse.json() as Server[];
      serverCount = servers.length;
      
      // Check apps
      const appsResponse = await fetch('/api/apps');
      const apps = await appsResponse.json() as App[];
      appCount = apps.length;
      
      // Check activities
      const activitiesResponse = await fetch('/api/activities');
      const activities = await activitiesResponse.json() as Activity[];
      activityCount = activities.length;
      
      // Check for server issues
      const problemServers = servers.filter(s => s.status === 'warning' || s.status === 'error');
      if (problemServers.length > 0) {
        issues.push(`${problemServers.length} servers have issues`);
      }
      
      // Check for app issues
      const problemApps = apps.filter(a => a.status !== 'active');
      if (problemApps.length > 0) {
        issues.push(`${problemApps.length} apps are not active`);
      }
      
      // Check worker status
      const workers = servers.filter(s => s.isWorker);
      if (workers.length === 0) {
        issues.push('No worker servers are active');
      }
      
      return {
        success: issues.length === 0,
        servers: serverCount,
        apps: appCount,
        activities: activityCount,
        issues
      };
    } catch (error) {
      console.error('Diagnostic failed:', error);
      issues.push(`Diagnostic error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        success: false,
        servers: serverCount,
        apps: appCount,
        activities: activityCount,
        issues
      };
    }
  }
}

// Create a singleton instance
export const autonomousOperator = new AutonomousOperator();