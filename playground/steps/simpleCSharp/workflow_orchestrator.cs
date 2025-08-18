using System;
using System.Threading.Tasks;
using System.Collections.Generic;

// Configuration for the Workflow Orchestrator Step
public class Config
{
    public string Type { get; set; } = "event";
    public string Name { get; set; } = "WorkflowOrchestrator";
    public string Description { get; set; } = "Orchestrates complex workflows involving multiple step types and coordinates between them";
    public string[] Subscribes { get; set; } = { "workflow.start", "step.completed", "step.failed" };
    public string[] Emits { get; set; } = { "workflow.step.triggered", "workflow.completed", "workflow.failed", "workflow.status.updated" };
    public string[] Flows { get; set; } = { "workflow-orchestration", "complex-workflows", "step-coordination" };
}

// Handler that orchestrates complex workflows
public class Handler
{
    public static async Task<object> Execute(MotiaContext context, object input)
    {
        var workflowId = Guid.NewGuid().ToString();
        var startTime = DateTime.UtcNow;
        
        await context.Logger.Info("Workflow orchestration started", new { 
            workflowId,
            traceId = context.TraceId,
            input = input
        });
        
        try
        {
            // Initialize workflow state
            var workflowState = await InitializeWorkflow(context, workflowId, input);
            
            // Store workflow state
            await context.State.Set(context.TraceId, $"workflow.{workflowId}", workflowState);
            
            // Emit workflow status update
            await context.Emit(new
            {
                topic = "workflow.status.updated",
                data = new
                {
                    workflowId,
                    status = "initialized",
                    state = workflowState,
                    timestamp = DateTime.UtcNow
                }
            });
            
            // Execute workflow steps based on the input
            var result = await ExecuteWorkflowSteps(context, workflowId, workflowState);
            
            // Update workflow state with completion
            workflowState.Status = "completed";
            workflowState.CompletedAt = DateTime.UtcNow;
            workflowState.Duration = (DateTime.UtcNow - startTime).TotalMilliseconds;
            workflowState.Result = result;
            
            await context.State.Set(context.TraceId, $"workflow.{workflowId}", workflowState);
            
            // Emit workflow completion
            await context.Emit(new
            {
                topic = "workflow.completed",
                data = new
                {
                    workflowId,
                    status = "completed",
                    result,
                    duration = workflowState.Duration,
                    timestamp = DateTime.UtcNow
                }
            });
            
            await context.Logger.Info("Workflow orchestration completed successfully", new { 
                workflowId,
                duration = workflowState.Duration
            });
            
            return new
            {
                success = true,
                workflowId,
                message = "Workflow orchestration completed successfully",
                result,
                duration = workflowState.Duration,
                timestamp = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            await context.Logger.Error("Workflow orchestration failed", new { 
                workflowId,
                error = ex.Message 
            });
            
            // Update workflow state with failure
            var failedState = new
            {
                workflowId,
                status = "failed",
                failedAt = DateTime.UtcNow,
                error = ex.Message,
                duration = (DateTime.UtcNow - startTime).TotalMilliseconds
            };
            
            await context.State.Set(context.TraceId, $"workflow.{workflowId}", failedState);
            
            // Emit workflow failure
            await context.Emit(new
            {
                topic = "workflow.failed",
                data = new
                {
                    workflowId,
                    status = "failed",
                    error = ex.Message,
                    duration = failedState.duration,
                    timestamp = DateTime.UtcNow
                }
            });
            
            throw;
        }
    }
    
    private static async Task<object> InitializeWorkflow(MotiaContext context, string workflowId, object input)
    {
        await context.Logger.Debug("Initializing workflow state...");
        
        var workflowState = new
        {
            WorkflowId = workflowId,
            Status = "initialized",
            StartedAt = DateTime.UtcNow,
            Input = input,
            Steps = new List<object>(),
            CurrentStep = 0,
            CompletedSteps = new List<string>(),
            FailedSteps = new List<string>(),
            Metadata = new
            {
                orchestrator = "C# Workflow Orchestrator",
                version = "1.0.0",
                language = "C#"
            }
        };
        
        await context.Logger.Debug("Workflow state initialized", new { workflowId });
        return workflowState;
    }
    
    private static async Task<object> ExecuteWorkflowSteps(MotiaContext context, string workflowId, dynamic workflowState)
    {
        await context.Logger.Debug("Executing workflow steps...");
        
        // Define workflow steps based on input
        var steps = await DetermineWorkflowSteps(context, workflowState.Input);
        var results = new List<object>();
        
        foreach (var step in steps)
        {
            try
            {
                await context.Logger.Debug($"Executing step: {step.Name}", new { step = step.Name });
                
                // Trigger step execution
                await context.Emit(new
                {
                    topic = "workflow.step.triggered",
                    data = new
                    {
                        workflowId,
                        step = step.Name,
                        stepType = step.Type,
                        input = step.Input,
                        timestamp = DateTime.UtcNow
                    }
                });
                
                // Simulate step execution (in real scenario, this would trigger actual step)
                var stepResult = await SimulateStepExecution(context, step);
                results.Add(stepResult);
                
                // Update workflow state
                workflowState.CompletedSteps.Add(step.Name);
                workflowState.CurrentStep++;
                
                await context.State.Set(context.TraceId, $"workflow.{workflowId}", workflowState);
                
                await context.Logger.Debug($"Step completed: {step.Name}", new { step = step.Name, result = stepResult });
                
                // Add delay between steps to simulate real workflow execution
                await Task.Delay(100);
            }
            catch (Exception ex)
            {
                await context.Logger.Error($"Step failed: {step.Name}", new { step = step.Name, error = ex.Message });
                
                workflowState.FailedSteps.Add(step.Name);
                workflowState.Status = "failed";
                
                await context.State.Set(context.TraceId, $"workflow.{workflowId}", workflowState);
                
                throw new Exception($"Step '{step.Name}' failed: {ex.Message}");
            }
        }
        
        return new
        {
            totalSteps = steps.Count,
            completedSteps = workflowState.CompletedSteps.Count,
            failedSteps = workflowState.FailedSteps.Count,
            results
        };
    }
    
    private static async Task<List<object>> DetermineWorkflowSteps(MotiaContext context, object input)
    {
        await context.Logger.Debug("Determining workflow steps based on input...");
        
        // This is a simplified example - in real scenarios, this would be more complex logic
        var steps = new List<object>
        {
            new { Name = "DataValidation", Type = "event", Input = new { action = "validate", data = input } },
            new { Name = "BusinessLogic", Type = "event", Input = new { action = "process", data = input } },
            new { Name = "ExternalIntegration", Type = "api", Input = new { action = "integrate", data = input } },
            new { Name = "DataPersistence", Type = "event", Input = new { action = "save", data = input } },
            new { Name = "Notification", Type = "event", Input = new { action = "notify", data = input } }
        };
        
        await context.Logger.Debug($"Determined {steps.Count} workflow steps");
        return steps;
    }
    
    private static async Task<object> SimulateStepExecution(MotiaContext context, dynamic step)
    {
        await context.Logger.Debug($"Simulating execution of step: {step.Name}");
        
        // Simulate different execution times based on step type
        var executionTime = step.Type == "api" ? 200 : 100;
        await Task.Delay(executionTime);
        
        var result = new
        {
            stepName = step.Name,
            stepType = step.Type,
            status = "completed",
            executionTime,
            result = $"Simulated result for {step.Name}",
            timestamp = DateTime.UtcNow
        };
        
        return result;
    }
}
