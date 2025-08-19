using MotiaCSharp.Types;
using MotiaCSharp;

public class ApiEndpointStep
{
    public static MotiaConfig config = new MotiaConfig
    {
        Type = "api",
        Name = "Test C# API Endpoint",
        Emits = new[] { "test" },
        Flows = new[] { "simple-csharp" },
        Path = "/test-csharp",
        Method = "POST"
    };

    public static async Task<object> handler(object req, MotiaContext context)
    {
        context.Logger.Info("Processing C# API step", new { body = req });

        // Set some state
        await context.State.Set(context.TraceId, "processed", "yes");
        context.Logger.Info("State set", new { message = "hello from C#" });

        // Emit an event
        await context.Emit(new MotiaEvent
        {
            Topic = "test",
            Data = req
        });

        // Return response
        return new
        {
            status = 200,
            body = new { message = "C# step processed successfully" }
        };
    }
}
