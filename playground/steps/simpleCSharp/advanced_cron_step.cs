using System;
using System.Threading.Tasks;
using System.Collections.Generic;

// Advanced Configuration for the Cron Step with multiple schedules
public class Config
{
    public string Type { get; set; } = "cron";
    public string Name { get; set; } = "AdvancedPeriodicJob";
    public string Description { get; set; } = "Advanced cron job with multiple schedules and complex logic";
    public string Cron { get; set; } = "*/15 * * * *"; // Every 15 minutes
    public string[] Emits { get; set; } = { "data-processed", "metrics-collected", "cleanup-completed" };
    public string[] Flows { get; set; } = { "advanced-cron-example", "data-pipeline" };
}

// Advanced handler with multiple operations
public class Handler
{
    public static async Task<object> Execute(MotiaContext context)
    {
        var startTime = DateTime.UtcNow;
        var jobId = Guid.NewGuid().ToString();
        
        await context.Logger.Info("Advanced C# Cron job started", new { 
            jobId, 
            timestamp = startTime,
            cronExpression = "*/15 * * * *"
        });
        
        try
        {
            // Step 1: Collect and process data
            var processedData = await ProcessData(context);
            await context.Emit(new
            {
                topic = "data-processed",
                data = new { 
                    jobId,
                    processedCount = processedData.Count,
                    timestamp = DateTime.UtcNow,
                    data = processedData
                }
            });
            
            // Step 2: Collect metrics
            var metrics = await CollectMetrics(context);
            await context.Emit(new
            {
                topic = "metrics-collected",
                data = new { 
                    jobId,
                    metrics,
                    timestamp = DateTime.UtcNow
                }
            });
            
            // Step 3: Perform cleanup operations
            var cleanupResult = await PerformCleanup(context);
            await context.Emit(new
            {
                topic = "cleanup-completed",
                data = new { 
                    jobId,
                    cleanupResult,
                    timestamp = DateTime.UtcNow
                }
            });
            
            // Store job completion in state
            await context.State.Set(context.TraceId, $"job.{jobId}", new
            {
                status = "completed",
                startTime,
                endTime = DateTime.UtcNow,
                duration = (DateTime.UtcNow - startTime).TotalMilliseconds,
                steps = new[] { "data-processed", "metrics-collected", "cleanup-completed" }
            });
            
            await context.Logger.Info("Advanced C# Cron job completed successfully", new { 
                jobId, 
                duration = (DateTime.UtcNow - startTime).TotalMilliseconds 
            });
            
            return new { 
                success = true, 
                jobId, 
                message = "Advanced cron job executed successfully",
                duration = (DateTime.UtcNow - startTime).TotalMilliseconds
            };
        }
        catch (Exception ex)
        {
            await context.Logger.Error("Advanced C# Cron job failed", new { 
                jobId, 
                error = ex.Message, 
                timestamp = DateTime.UtcNow 
            });
            
            // Store failure in state
            await context.State.Set(context.TraceId, $"job.{jobId}", new
            {
                status = "failed",
                startTime,
                endTime = DateTime.UtcNow,
                error = ex.Message
            });
            
            throw;
        }
    }
    
    private static async Task<List<object>> ProcessData(MotiaContext context)
    {
        await context.Logger.Debug("Processing data...");
        
        // Simulate data processing
        await Task.Delay(100); // Simulate work
        
        var data = new List<object>
        {
            new { id = 1, value = "processed-item-1", timestamp = DateTime.UtcNow },
            new { id = 2, value = "processed-item-2", timestamp = DateTime.UtcNow },
            new { id = 3, value = "processed-item-3", timestamp = DateTime.UtcNow }
        };
        
        await context.Logger.Debug("Data processing completed", new { count = data.Count });
        return data;
    }
    
    private static async Task<object> CollectMetrics(MotiaContext context)
    {
        await context.Logger.Debug("Collecting metrics...");
        
        // Simulate metrics collection
        await Task.Delay(50); // Simulate work
        
        var metrics = new
        {
            memoryUsage = GC.GetTotalMemory(false),
            cpuTime = Environment.TickCount,
            activeThreads = Environment.ProcessorCount,
            timestamp = DateTime.UtcNow
        };
        
        await context.Logger.Debug("Metrics collection completed");
        return metrics;
    }
    
    private static async Task<object> PerformCleanup(MotiaContext context)
    {
        await context.Logger.Debug("Performing cleanup...");
        
        // Simulate cleanup operations
        await Task.Delay(75); // Simulate work
        
        var cleanupResult = new
        {
            filesRemoved = 5,
            cacheCleared = true,
            oldRecordsDeleted = 12,
            timestamp = DateTime.UtcNow
        };
        
        await context.Logger.Debug("Cleanup completed");
        return cleanupResult;
    }
}
