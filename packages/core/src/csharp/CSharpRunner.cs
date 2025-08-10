using System.Reflection;
using System.Text.Json;
using MotiaCSharp.Types;
using MotiaCSharp.Communication;
using MotiaCSharp.Middleware;

namespace MotiaCSharp
{
    public class CSharpRunner
    {
        public static async Task Main(string[] args)
        {
            if (args.Length < 1)
            {
                Console.Error.WriteLine("Usage: dotnet run <file-path> [args]");
                Environment.Exit(1);
            }

            var filePath = args[0];
            var jsonArgs = args.Length > 1 ? args[1] : "{}";

            try
            {
                await RunCSharpModule(filePath, jsonArgs);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error: {ex.Message}");
                Console.Error.WriteLine(ex.StackTrace);
                Environment.Exit(1);
            }
        }

        private static async Task RunCSharpModule(string filePath, string jsonArgs)
        {
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"Could not load module from {filePath}");
            }

            // Parse arguments
            var args = JsonSerializer.Deserialize<JsonElement>(jsonArgs);
            
            var traceId = args.GetProperty("traceId").GetString() ?? string.Empty;
            var flows = args.GetProperty("flows").EnumerateArray().Select(x => x.GetString() ?? string.Empty).ToArray();
            var data = args.GetProperty("data").GetRawText();
            var contextInFirstArg = args.GetProperty("contextInFirstArg").GetBoolean();
            var streamsConfig = args.GetProperty("streams").EnumerateArray().Select(x => x.GetProperty("name").GetString() ?? string.Empty).ToArray();

            // Create RPC and context
            var rpc = new MotiaRpc();
            var streams = CreateStreams(streamsConfig, rpc);
            var context = new MotiaContext(rpc, traceId, flows, streams);

            try
            {
                // Load the C# assembly
                var assembly = Assembly.LoadFrom(filePath);
                
                // Find the handler function
                var handlerType = assembly.GetTypes().FirstOrDefault(t => 
                    t.GetMethod("handler") != null || 
                    t.GetMethod("Handler") != null);

                if (handlerType == null)
                {
                    throw new InvalidOperationException($"Function 'handler' not found in module {filePath}");
                }

                var handlerMethod = handlerType.GetMethod("handler") ?? handlerType.GetMethod("Handler");
                if (handlerMethod == null)
                {
                    throw new InvalidOperationException($"Handler method not found in {handlerType.Name}");
                }

                // Find config
                var configProperty = handlerType.GetProperty("config") ?? handlerType.GetProperty("Config");
                var config = configProperty?.GetValue(null) as MotiaConfig;

                // Execute handler
                object? result;
                if (contextInFirstArg)
                {
                    result = handlerMethod.Invoke(null, new object[] { context });
                }
                else
                {
                    result = handlerMethod.Invoke(null, new object[] { data, context });
                }

                // Handle async result
                if (result is Task task)
                {
                    await task;
                    if (task.GetType().IsGenericType)
                    {
                        var resultProperty = task.GetType().GetProperty("Result");
                        result = resultProperty?.GetValue(task);
                    }
                }

                // Send result back
                if (result != null)
                {
                    await rpc.SendAsync("result", result);
                }

                // Close successfully
                rpc.SendNoWait("close", null);
            }
            catch (Exception ex)
            {
                // Send error back
                rpc.SendNoWait("close", new
                {
                    message = ex.Message,
                    stack = ex.StackTrace
                });
            }
            finally
            {
                rpc.Close();
            }
        }

        private static dynamic CreateStreams(string[] streamNames, IMotiaRpc rpc)
        {
            // Create a dynamic object with stream managers
            var streams = new System.Dynamic.ExpandoObject() as IDictionary<string, object>;
            
            foreach (var name in streamNames)
            {
                streams[name] = new MotiaStreamManager(name, rpc);
            }

            return streams;
        }
    }
}
