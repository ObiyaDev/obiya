using System;
using System.Threading.Tasks;

// Configuration for the Cron Step
public class Config
{
    public string Type { get; set; } = "cron";
    public string Name { get; set; } = "PeriodicJob";
    public string Description { get; set; } = "Runs every hour at minute 0 and emits a timestamp";
    public string Cron { get; set; } = "0 * * * *"; // Every hour at minute 0
    public string[] Emits { get; set; } = { "cron-ticked" };
    public string[] Flows { get; set; } = { "cron-example" };
}

// The handler function that contains the logic to be executed when the cron schedule is met
public class Handler
{
    public static async Task<object> Execute(MotiaContext context)
    {
        // Log that the cron job has started
        await context.Logger.Info("C# Cron job started", new { timestamp = DateTime.UtcNow });
        
        try
        {
            // Emit an event with the current timestamp
            await context.Emit(new
            {
                topic = "cron-ticked",
                data = new { 
                    message = "C# Cron job executed successfully at " + DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                    timestamp = DateTime.UtcNow,
                    language = "C#"
                }
            });
            
            // Log successful completion
            await context.Logger.Info("C# Cron job completed successfully", new { timestamp = DateTime.UtcNow });
            
            return new { success = true, message = "Cron job executed successfully" };
        }
        catch (Exception ex)
        {
            // Log any errors that occur
            await context.Logger.Error("C# Cron job failed", new { error = ex.Message, timestamp = DateTime.UtcNow });
            throw;
        }
    }
}
