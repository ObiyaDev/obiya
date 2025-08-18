using MotiaCSharp.Types;
using MotiaCSharp;
using System.Text.Json;

namespace MotiaCSharp.Examples
{
    /// <summary>
    /// Comprehensive example demonstrating all C# step capabilities
    /// </summary>
    public class ComprehensiveExample
    {
        public static MotiaConfig config = new MotiaConfig
        {
            Type = "event",
            Name = "Comprehensive C# Example",
            Description = "Demonstrates all C# step features including state, streams, middleware, and error handling",
            Subscribes = new[] { "comprehensive-example" },
            Emits = new[] { "example-completed", "example-error" },
            Flows = new[] { "comprehensive-demo" },
            Middleware = new object[] { LoggingMiddleware, ValidationMiddleware },
            Timeout = 30000,
            Retries = 3,
            Parallel = false
        };

        public static async Task<object> handler(object data, MotiaContext context)
        {
            try
            {
                context.Logger.Info("Starting comprehensive example", new { data, traceId = context.TraceId });

                // 1. State Management Examples
                await DemonstrateStateManagement(context);

                // 2. Stream Management Examples
                await DemonstrateStreamManagement(context);

                // 3. Event Emission Examples
                await DemonstrateEventEmission(context, data);

                // 4. Error Handling Examples
                await DemonstrateErrorHandling(context);

                // 5. Advanced Features
                await DemonstrateAdvancedFeatures(context);

                context.Logger.Info("Comprehensive example completed successfully");

                return new StepResult
                {
                    Success = true,
                    Data = new
                    {
                        message = "Comprehensive example completed",
                        timestamp = DateTime.UtcNow,
                        features = new[] { "state", "streams", "events", "middleware", "validation" }
                    },
                    Metadata = new Dictionary<string, object>
                    {
                        ["executionTime"] = DateTime.UtcNow,
                        ["version"] = "1.0.0"
                    }
                };
            }
            catch (Exception ex)
            {
                context.Logger.Error("Comprehensive example failed", new { error = ex.Message, stack = ex.StackTrace });

                await context.Emit(new MotiaEvent
                {
                    Topic = "example-error",
                    Data = new MotiaError
                    {
                        Message = ex.Message,
                        Code = "COMPREHENSIVE_EXAMPLE_ERROR",
                        Stack = ex.StackTrace,
                        Details = new { step = "comprehensive-example" }
                    }
                });

                return new StepResult
                {
                    Success = false,
                    Error = new MotiaError
                    {
                        Message = ex.Message,
                        Code = "COMPREHENSIVE_EXAMPLE_ERROR",
                        Stack = ex.StackTrace
                    }
                };
            }
        }

        private static async Task DemonstrateStateManagement(MotiaContext context)
        {
            context.Logger.Info("Demonstrating state management");

            // Set various types of state
            await context.State.Set(context.TraceId, "string-value", "Hello from C#");
            await context.State.Set(context.TraceId, "number-value", 42);
            await context.State.Set(context.TraceId, "boolean-value", true);
            await context.State.Set(context.TraceId, "object-value", new { name = "test", value = 123 });
            await context.State.Set(context.TraceId, "array-value", new[] { 1, 2, 3, 4, 5 });

            // Retrieve and verify state
            var stringValue = await context.State.Get<string>(context.TraceId, "string-value");
            var numberValue = await context.State.Get<int>(context.TraceId, "number-value");
            var booleanValue = await context.State.Get<bool>(context.TraceId, "boolean-value");

            context.Logger.Info("State values retrieved", new { stringValue, numberValue, booleanValue });

            // Check if keys exist
            var exists = await context.State.Exists(context.TraceId, "string-value");
            context.Logger.Info("Key exists check", new { key = "string-value", exists });

            // Get all state for this trace
            var allState = await context.State.GetAll(context.TraceId);
            context.Logger.Info("All state retrieved", new { stateCount = allState.Count });
        }

        private static async Task DemonstrateStreamManagement(MotiaContext context)
        {
            context.Logger.Info("Demonstrating stream management");

            // Access streams if configured
            if (context.Streams != null)
            {
                try
                {
                    // Example: working with a user stream
                    var userStream = context.Streams.user;
                    if (userStream != null)
                    {
                        // Set user data
                        await userStream.Set("group1", "user123", new
                        {
                            id = "user123",
                            name = "John Doe",
                            email = "john@example.com",
                            lastLogin = DateTime.UtcNow
                        });

                        // Retrieve user data
                        var user = await userStream.Get<object>("group1", "user123");
                        context.Logger.Info("User data retrieved from stream", new { user });

                        // Get all users in a group
                        var allUsers = await userStream.GetAllInGroup<object>("group1");
                        context.Logger.Info("All users in group retrieved", new { userCount = allUsers.Count });
                    }
                }
                catch (Exception ex)
                {
                    context.Logger.Warn("Stream operations not available", new { error = ex.Message });
                }
            }
        }

        private static async Task DemonstrateEventEmission(MotiaContext context, object data)
        {
            context.Logger.Info("Demonstrating event emission");

            // Emit a simple event
            await context.Emit(new MotiaEvent
            {
                Topic = "example-completed",
                Data = new
                {
                    message = "Comprehensive example step completed",
                    originalData = data,
                    timestamp = DateTime.UtcNow,
                    traceId = context.TraceId
                },
                Metadata = new Dictionary<string, object>
                {
                    ["source"] = "comprehensive-example",
                    ["version"] = "1.0.0"
                }
            });

            context.Logger.Info("Event emitted successfully");
        }

        private static async Task DemonstrateErrorHandling(MotiaContext context)
        {
            context.Logger.Info("Demonstrating error handling");

            try
            {
                // Simulate a potential error condition
                var random = new Random();
                if (random.Next(1, 10) == 1) // 10% chance of error
                {
                    throw new InvalidOperationException("Simulated error for demonstration");
                }

                context.Logger.Info("No errors occurred in this execution");
            }
            catch (Exception ex)
            {
                context.Logger.Error("Error occurred during demonstration", new { error = ex.Message });
                
                // Emit error event
                await context.Emit(new MotiaEvent
                {
                    Topic = "example-error",
                    Data = new MotiaError
                    {
                        Message = ex.Message,
                        Code = "DEMO_ERROR",
                        Stack = ex.StackTrace
                    }
                });
            }
        }

        private static async Task DemonstrateAdvancedFeatures(MotiaContext context)
        {
            context.Logger.Info("Demonstrating advanced features");

            // JSON Schema validation example
            var requestSchema = new JsonObjectSchema
            {
                Properties = new Dictionary<string, JsonSchema>
                {
                    ["name"] = new JsonStringSchema
                    {
                        MinLength = 1,
                        MaxLength = 100
                    },
                    ["age"] = new JsonNumberSchema
                    {
                        Minimum = 0,
                        Maximum = 150
                    },
                    ["active"] = new JsonBooleanSchema()
                },
                Required = new[] { "name", "age" }
            };

            context.Logger.Info("JSON Schema created", new { schema = requestSchema });

            // Demonstrate parallel processing simulation
            var tasks = new List<Task<string>>();
            for (int i = 0; i < 3; i++)
            {
                var taskId = i;
                tasks.Add(Task.Run(async () =>
                {
                    await Task.Delay(100); // Simulate work
                    return $"Task {taskId} completed";
                }));
            }

            var results = await Task.WhenAll(tasks);
            context.Logger.Info("Parallel tasks completed", new { results });
        }

        // Middleware Examples
        public static async Task<object?> LoggingMiddleware(object? data, MotiaContext context, Func<Task<object?>> next)
        {
            context.Logger.Info("LoggingMiddleware: Before execution", new { data, traceId = context.TraceId });
            
            var startTime = DateTime.UtcNow;
            var result = await next();
            var executionTime = DateTime.UtcNow - startTime;
            
            context.Logger.Info("LoggingMiddleware: After execution", new { executionTime, result });
            
            return result;
        }

        public static async Task<object?> ValidationMiddleware(object? data, MotiaContext context, Func<Task<object?>> next)
        {
            context.Logger.Info("ValidationMiddleware: Validating input", new { data });
            
            // Simple validation - ensure data is not null
            if (data == null)
            {
                context.Logger.Warn("ValidationMiddleware: Data is null, using default");
                data = new { message = "Default data" };
            }
            
            var result = await next();
            
            context.Logger.Info("ValidationMiddleware: Validation completed");
            
            return result;
        }
    }
}
