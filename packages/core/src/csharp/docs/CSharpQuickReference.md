# C# Quick Reference Guide

This is a quick reference for common patterns and syntax when working with Motia C# steps.

## Step Template

```csharp
using MotiaCSharp.Types;
using MotiaCSharp;

namespace YourNamespace
{
    public class YourStep
    {
        public static MotiaConfig config = new MotiaConfig
        {
            Type = "event", // event, api, cron, ui
            Name = "Step Name",
            Description = "Description",
            Subscribes = new[] { "topic" },
            Emits = new[] { "output.topic" },
            Flows = new[] { "flow" }
        };

        public static async Task<object> handler(object data, MotiaContext context)
        {
            // Your logic here
            return new { success = true };
        }
    }
}
```

## Configuration Options

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `Type` | string | Step type | `"event"`, `"api"`, `"cron"`, `"ui"` |
| `Name` | string | Step name | `"User Registration"` |
| `Description` | string | Step description | `"Handles new user registrations"` |
| `Subscribes` | string[] | Topics to subscribe to | `new[] { "user.created" }` |
| `Emits` | string[] | Topics to emit | `new[] { "user.processed" }` |
| `Flows` | string[] | Associated flows | `new[] { "user-onboarding" }` |
| `Path` | string | API endpoint path | `"/api/users"` |
| `Method` | string | HTTP method | `"POST"`, `"GET"` |
| `Cron` | string | Cron expression | `"0 0 * * *"` |
| `Timeout` | int | Timeout in milliseconds | `30000` |
| `Retries` | int | Number of retries | `3` |
| `Parallel` | bool | Enable parallel execution | `false` |

## Context Usage

```csharp
public static async Task<object> handler(object data, MotiaContext context)
{
    // Access properties
    var traceId = context.TraceId;
    var flows = context.Flows;
    
    // Logging
    context.Logger.Info("Processing", new { data, traceId });
    context.Logger.Warn("Warning message");
    context.Logger.Error("Error message");
    
    // State management
    await context.State.Set(traceId, "key", "value");
    var value = await context.State.Get<string>(traceId, "key");
    
    // Event emission
    await context.Emit(new MotiaEvent
    {
        Topic = "event.topic",
        Data = new { message = "Hello" }
    });
    
    return new { success = true };
}
```

## State Management

```csharp
// Set state
await context.State.Set(traceId, "user.id", "12345");
await context.State.Set(traceId, "user.name", "John");

// Get state
var userId = await context.State.Get<string>(traceId, "user.id");
var userName = await context.State.Get<string>(traceId, "user.name");

// Check existence
var exists = await context.State.Exists(traceId, "user.id");

// Delete state
await context.State.Delete(traceId, "user.id");

// Get all state
var allState = await context.State.GetAll(traceId);

// Clear all state
await context.State.Clear(traceId);
```

## Stream Management

```csharp
if (context.Streams != null)
{
    var userStream = context.Streams.user;
    
    // Set data
    await userStream.Set("group", "id", data);
    
    // Get data
    var data = await userStream.Get<object>("group", "id");
    
    // Get all in group
    var allData = await userStream.GetAllInGroup<object>("group");
    
    // Delete data
    await userStream.Delete("group", "id");
    
    // Clear group
    await userStream.ClearGroup("group");
}
```

## Event Emission

```csharp
// Simple event
await context.Emit(new MotiaEvent
{
    Topic = "user.created",
    Data = new { userId = "12345" }
});

// Event with metadata
await context.Emit(new MotiaEvent
{
    Topic = "order.processed",
    Data = new { orderId = "ORD-001" },
    Metadata = new Dictionary<string, object>
    {
        ["source"] = "csharp-step",
        ["timestamp"] = DateTime.UtcNow
    }
});
```

## Middleware

```csharp
public static async Task<object?> LoggingMiddleware(object? data, MotiaContext context, Func<Task<object?>> next)
{
    var startTime = DateTime.UtcNow;
    var result = await next();
    var executionTime = DateTime.UtcNow - startTime;
    
    context.Logger.Info("Completed", new { executionTime });
    return result;
}

// Use in config
public static MotiaConfig config = new MotiaConfig
{
    Type = "event",
    Name = "Step with Middleware",
    Middleware = new object[] { LoggingMiddleware }
};
```

## Error Handling

```csharp
public static async Task<object> handler(object data, MotiaContext context)
{
    try
    {
        // Your logic here
        return new StepResult
        {
            Success = true,
            Data = new { message = "Success" }
        };
    }
    catch (Exception ex)
    {
        context.Logger.Error("Error occurred", new { error = ex.Message });
        
        return new StepResult
        {
            Success = false,
            Error = new MotiaError
            {
                Message = ex.Message,
                Code = "STEP_ERROR"
            }
        };
    }
}
```

## JSON Schema Types

```csharp
// String schema
new JsonStringSchema
{
    MinLength = 1,
    MaxLength = 100,
    Pattern = @"^[a-zA-Z]+$"
}

// Number schema
new JsonNumberSchema
{
    Minimum = 0,
    Maximum = 100
}

// Boolean schema
new JsonBooleanSchema()

// Array schema
new JsonArraySchema
{
    Items = new JsonStringSchema(),
    MinItems = 1,
    MaxItems = 10
}

// Object schema
new JsonObjectSchema
{
    Properties = new Dictionary<string, JsonSchema>
    {
        ["name"] = new JsonStringSchema(),
        ["age"] = new JsonNumberSchema()
    },
    Required = new[] { "name" }
}
```

## Common Patterns

### API Step with Validation

```csharp
public static async Task<object> handler(object data, MotiaContext context)
{
    // Parse request
    var request = JsonSerializer.Deserialize<RequestModel>(JsonSerializer.Serialize(data));
    
    // Validate
    if (string.IsNullOrEmpty(request.Name))
        return CreateErrorResponse("Name is required", 400);
    
    // Process
    var result = await ProcessRequest(request, context);
    
    // Return success
    return CreateSuccessResponse(result);
}
```

### Event Step with State

```csharp
public static async Task<object> handler(object data, MotiaContext context)
{
    // Get previous state
    var previousData = await context.State.Get<object>(context.TraceId, "previous.data");
    
    // Process new data
    var result = await ProcessData(data, previousData, context);
    
    // Store new state
    await context.State.Set(context.TraceId, "previous.data", result);
    
    // Emit event
    await context.Emit(new MotiaEvent
    {
        Topic = "data.processed",
        Data = result
    });
    
    return result;
}
```

### Cron Step with Cleanup

```csharp
public static async Task<object> handler(object data, MotiaContext context)
{
    // Get all traces that need cleanup
    var oldTraces = await GetOldTraces(context);
    
    foreach (var traceId in oldTraces)
    {
        try
        {
            await context.State.Clear(traceId);
            context.Logger.Info("Cleaned up trace", new { traceId });
        }
        catch (Exception ex)
        {
            context.Logger.Warn("Failed to cleanup trace", new { traceId, error = ex.Message });
        }
    }
    
    return new { cleanedTraces = oldTraces.Length };
}
```

## Testing

```csharp
[Test]
public async Task Handler_WithValidData_ReturnsSuccess()
{
    // Arrange
    var mockContext = CreateMockContext();
    var testData = new { name = "John" };
    
    // Act
    var result = await YourStep.handler(testData, mockContext);
    
    // Assert
    Assert.IsNotNull(result);
}
```

## Best Practices

1. **Always use async/await** for I/O operations
2. **Handle errors gracefully** with try-catch blocks
3. **Log important events** for debugging
4. **Use descriptive state keys** with dot notation
5. **Validate input data** before processing
6. **Emit events** for important state changes
7. **Use middleware** for cross-cutting concerns
8. **Return structured results** with StepResult
9. **Clean up resources** properly
10. **Test your steps** thoroughly

## Common Issues

### Issue: Step not executing
- Check that the `handler` method is public and static
- Verify the `config` is properly defined
- Ensure the step file is in the correct directory

### Issue: State not persisting
- Verify you're using the correct `traceId`
- Check that state operations are awaited
- Ensure the state adapter is properly configured

### Issue: Events not being emitted
- Verify the `Emit` method is awaited
- Check that the event topic is correct
- Ensure the event manager is properly configured

### Issue: Middleware not working
- Verify middleware methods are public and static
- Check that middleware is properly referenced in config
- Ensure middleware signature matches expected pattern
