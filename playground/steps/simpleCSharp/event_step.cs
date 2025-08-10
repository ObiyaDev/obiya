using MotiaCSharp.Types;
using MotiaCSharp;

public class EventStep
{
    public static MotiaConfig config = new MotiaConfig
    {
        Type = "event",
        Name = "Test C# Event Step",
        Subscribes = new[] { "test" },
        Flows = new[] { "simple-csharp" }
    };

    public static async Task<object> handler(object data, MotiaContext context)
    {
        context.Logger.Info("Processing C# event step", new { data });

        // Process the incoming event data
        await context.State.Set(context.TraceId, "event_processed", DateTime.UtcNow.ToString());
        
        context.Logger.Info("Event processed successfully", new { 
            traceId = context.TraceId,
            flows = context.Flows 
        });

        // You can emit new events here if needed
        await context.Emit(new MotiaEvent
        {
            Topic = "event_completed",
            Data = new { originalData = data, processedAt = DateTime.UtcNow }
        });

        return new { success = true, message = "Event processed by C# step" };
    }
}
