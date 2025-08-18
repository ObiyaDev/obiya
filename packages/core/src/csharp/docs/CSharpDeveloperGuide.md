# Motia C# Developer Guide

Welcome to the Motia C# Developer Guide! This guide will help you understand how to create and deploy C# steps in the Motia workflow engine.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Step Types](#step-types)
3. [Core Concepts](#core-concepts)
4. [State Management](#state-management)
5. [Stream Management](#stream-management)
6. [Event Handling](#event-handling)
7. [Middleware](#middleware)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [Best Practices](#best-practices)
11. [Examples](#examples)

## Getting Started

### Prerequisites

- .NET 8.0 or later
- Visual Studio 2022 or VS Code with C# extension
- Basic understanding of async/await patterns
- Familiarity with JSON and REST APIs

### Project Structure

Your C# step should follow this basic structure:

```csharp
using MotiaCSharp.Types;
using MotiaCSharp;

namespace YourNamespace
{
    public class YourStep
    {
        public static MotiaConfig config = new MotiaConfig
        {
            Type = "event", // or "api", "cron", "ui"
            Name = "Your Step Name",
            Description = "Description of what your step does",
            Subscribes = new[] { "topic-to-subscribe-to" },
            Emits = new[] { "topic-to-emit" },
            Flows = new[] { "flow-name" }
        };

        public static async Task<object> handler(object data, MotiaContext context)
        {
            // Your step logic here
            return new { success = true, message = "Step completed" };
        }
    }
}
```

## Step Types

### Event Steps

Event steps are the most common type and handle asynchronous events:

```csharp
public static MotiaConfig config = new MotiaConfig
{
    Type = "event",
    Name = "User Registration Handler",
    Subscribes = new[] { "user.registered" },
    Emits = new[] { "user.welcome.email.sent", "user.profile.created" }
};
```

### API Steps

API steps handle HTTP requests and responses:

```csharp
public static MotiaConfig config = new MotiaConfig
{
    Type = "api",
    Name = "User API",
    Path = "/api/users",
    Method = "POST",
    BodySchema = new JsonObjectSchema { /* schema definition */ },
    ResponseSchema = new JsonObjectSchema { /* response schema */ }
};
```

### Cron Steps

Cron steps execute on a schedule:

```csharp
public static MotiaConfig config = new MotiaConfig
{
    Type = "cron",
    Name = "Daily Report Generator",
    Cron = "0 0 * * *", // Daily at midnight
    Emits = new[] { "daily.report.generated" }
};
```

### UI Steps

UI steps provide custom UI components:

```csharp
public static MotiaConfig config = new MotiaConfig
{
    Type = "ui",
    Name = "User Dashboard",
    Emits = new[] { "ui.user.dashboard.updated" }
};
```

## Core Concepts

### MotiaContext

The `MotiaContext` provides access to all the tools you need:

```csharp
public static async Task<object> handler(object data, MotiaContext context)
{
    // Access trace ID for debugging
    var traceId = context.TraceId;
    
    // Access flow information
    var flows = context.Flows;
    
    // Use state management
    await context.State.Set(traceId, "key", "value");
    
    // Use logging
    context.Logger.Info("Processing data", new { data, traceId });
    
    // Emit events
    await context.Emit(new MotiaEvent
    {
        Topic = "step.completed",
        Data = new { message = "Success" }
    });
    
    return new { success = true };
}
```

### Configuration Options

```csharp
public static MotiaConfig config = new MotiaConfig
{
    // Basic configuration
    Type = "event",
    Name = "Step Name",
    Description = "Step description",
    
    // Event configuration
    Subscribes = new[] { "topic1", "topic2" },
    Emits = new[] { "output.topic" },
    
    // Flow configuration
    Flows = new[] { "flow1", "flow2" },
    
    // API configuration
    Path = "/api/endpoint",
    Method = "POST",
    
    // Cron configuration
    Cron = "0 0 * * *",
    
    // Advanced configuration
    Middleware = new object[] { LoggingMiddleware, ValidationMiddleware },
    Timeout = 30000, // 30 seconds
    Retries = 3,
    Parallel = false
};
```

## State Management

### Basic State Operations

```csharp
// Set state
await context.State.Set(context.TraceId, "user.id", "12345");
await context.State.Set(context.TraceId, "user.name", "John Doe");
await context.State.Set(context.TraceId, "user.preferences", new { theme = "dark" });

// Get state
var userId = await context.State.Get<string>(context.TraceId, "user.id");
var userName = await context.State.Get<string>(context.TraceId, "user.name");
var preferences = await context.State.Get<object>(context.TraceId, "user.preferences");

// Check if key exists
var exists = await context.State.Exists(context.TraceId, "user.id");

// Delete specific key
await context.State.Delete(context.TraceId, "user.id");

// Get all state for a trace
var allState = await context.State.GetAll(context.TraceId);

// Clear all state for a trace
await context.State.Clear(context.TraceId);
```

### State Best Practices

- Use descriptive key names with dot notation (e.g., `user.profile.email`)
- Store complex objects as JSON-serializable types
- Consider state expiration for temporary data
- Use state for cross-step communication within a flow

## Stream Management

### Working with Streams

```csharp
// Access streams through context
if (context.Streams != null)
{
    try
    {
        // Get a specific stream
        var userStream = context.Streams.user;
        
        if (userStream != null)
        {
            // Set data in a stream group
            await userStream.Set("group1", "user123", new
            {
                id = "user123",
                name = "John Doe",
                email = "john@example.com"
            });
            
            // Get data from a stream
            var user = await userStream.Get<object>("group1", "user123");
            
            // Get all data in a group
            var allUsers = await userStream.GetAllInGroup<object>("group1");
            
            // Delete specific data
            await userStream.Delete("group1", "user123");
            
            // Clear entire group
            await userStream.ClearGroup("group1");
        }
    }
    catch (Exception ex)
    {
        context.Logger.Warn("Stream operations not available", new { error = ex.Message });
    }
}
```

## Event Handling

### Emitting Events

```csharp
// Simple event emission
await context.Emit(new MotiaEvent
{
    Topic = "user.created",
    Data = new { userId = "12345", name = "John Doe" }
});

// Event with metadata
await context.Emit(new MotiaEvent
{
    Topic = "order.processed",
    Data = new { orderId = "ORD-001", amount = 99.99 },
    Metadata = new Dictionary<string, object>
    {
        ["source"] = "csharp-step",
        ["version"] = "1.0.0",
        ["timestamp"] = DateTime.UtcNow
    }
});
```

### Event Data Structure

```csharp
public class MotiaEvent
{
    public string Topic { get; set; } = string.Empty;
    public object? Data { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}
```

## Middleware

### Creating Middleware

```csharp
public static async Task<object?> LoggingMiddleware(object? data, MotiaContext context, Func<Task<object?>> next)
{
    var startTime = DateTime.UtcNow;
    
    context.Logger.Info("Middleware: Before execution", new { data });
    
    var result = await next();
    
    var executionTime = DateTime.UtcNow - startTime;
    context.Logger.Info("Middleware: After execution", new { executionTime, result });
    
    return result;
}

public static async Task<object?> ValidationMiddleware(object? data, MotiaContext context, Func<Task<object?>> next)
{
    if (data == null)
    {
        throw new ArgumentException("Data cannot be null");
    }
    
    // Perform validation logic here
    
    return await next();
}
```

### Using Middleware

```csharp
public static MotiaConfig config = new MotiaConfig
{
    Type = "event",
    Name = "Step with Middleware",
    Middleware = new object[] { LoggingMiddleware, ValidationMiddleware }
};
```

## Error Handling

### Structured Error Handling

```csharp
public static async Task<object> handler(object data, MotiaContext context)
{
    try
    {
        // Your step logic here
        var result = await ProcessData(data, context);
        
        return new StepResult
        {
            Success = true,
            Data = result,
            Metadata = new Dictionary<string, object>
            {
                ["executionTime"] = DateTime.UtcNow
            }
        };
    }
    catch (ValidationException ex)
    {
        context.Logger.Warn("Validation error", new { error = ex.Message, field = ex.Field });
        
        return new StepResult
        {
            Success = false,
            Error = new MotiaError
            {
                Message = ex.Message,
                Code = "VALIDATION_ERROR",
                Details = new { field = ex.Field }
            }
        };
    }
    catch (Exception ex)
    {
        context.Logger.Error("Unexpected error", new { error = ex.Message, stack = ex.StackTrace });
        
        // Emit error event
        await context.Emit(new MotiaEvent
        {
            Topic = "step.error",
            Data = new MotiaError
            {
                Message = ex.Message,
                Code = "UNEXPECTED_ERROR",
                Stack = ex.StackTrace
            }
        });
        
        return new StepResult
        {
            Success = false,
            Error = new MotiaError
            {
                Message = "Internal server error",
                Code = "INTERNAL_ERROR"
            }
        };
    }
}
```

### Custom Exceptions

```csharp
public class ValidationException : Exception
{
    public string Field { get; }
    
    public ValidationException(string message, string field) : base(message)
    {
        Field = field;
    }
}

public class BusinessRuleException : Exception
{
    public string RuleCode { get; }
    
    public BusinessRuleException(string message, string ruleCode) : base(message)
    {
        RuleCode = ruleCode;
    }
}
```

## Testing

### Unit Testing Your Steps

```csharp
[Test]
public async Task Handler_WithValidData_ReturnsSuccess()
{
    // Arrange
    var mockContext = CreateMockContext();
    var testData = new { name = "John", email = "john@example.com" };
    
    // Act
    var result = await YourStep.handler(testData, mockContext);
    
    // Assert
    Assert.IsNotNull(result);
    // Add more assertions based on your expected result structure
}

private MotiaContext CreateMockContext()
{
    // Create mock context with necessary dependencies
    // This would depend on your testing framework
}
```

### Integration Testing

```csharp
[Test]
public async Task Step_Integration_WithRealContext()
{
    // Test with real Motia context
    // This would test the actual step execution
}
```

## Best Practices

### Code Organization

1. **Single Responsibility**: Each step should do one thing well
2. **Error Handling**: Always handle errors gracefully
3. **Logging**: Log important events and errors
4. **State Management**: Use state for cross-step communication
5. **Event Emission**: Emit events for important state changes

### Performance Considerations

1. **Async Operations**: Use async/await for I/O operations
2. **State Access**: Minimize state access operations
3. **Stream Operations**: Batch stream operations when possible
4. **Memory Management**: Dispose of resources properly

### Security

1. **Input Validation**: Always validate input data
2. **Authentication**: Implement proper authentication in API steps
3. **Authorization**: Check permissions before performing operations
4. **Data Sanitization**: Sanitize data before storing or processing

### Monitoring and Observability

1. **Structured Logging**: Use structured logging with context
2. **Metrics**: Track important metrics like execution time
3. **Tracing**: Use trace IDs for request correlation
4. **Health Checks**: Implement health check endpoints

## Examples

### Complete Event Step Example

```csharp
using MotiaCSharp.Types;
using MotiaCSharp;

namespace MotiaCSharp.Examples
{
    public class UserRegistrationStep
    {
        public static MotiaConfig config = new MotiaConfig
        {
            Type = "event",
            Name = "User Registration Handler",
            Description = "Handles new user registrations",
            Subscribes = new[] { "user.registered" },
            Emits = new[] { "user.welcome.email.sent", "user.profile.created" },
            Flows = new[] { "user-onboarding" },
            Middleware = new object[] { LoggingMiddleware, ValidationMiddleware },
            Timeout = 30000,
            Retries = 2
        };

        public static async Task<object> handler(object data, MotiaContext context)
        {
            try
            {
                context.Logger.Info("Processing user registration", new { data, traceId = context.TraceId });

                // Parse and validate user data
                var userData = ParseUserData(data);
                ValidateUserData(userData);

                // Store user in state
                await context.State.Set(context.TraceId, "user.data", userData);

                // Create user profile
                var profile = await CreateUserProfile(userData, context);

                // Send welcome email
                await SendWelcomeEmail(userData, context);

                // Emit success events
                await context.Emit(new MotiaEvent
                {
                    Topic = "user.profile.created",
                    Data = new { userId = profile.Id, profile = profile }
                });

                await context.Emit(new MotiaEvent
                {
                    Topic = "user.welcome.email.sent",
                    Data = new { userId = profile.Id, email = userData.Email }
                });

                context.Logger.Info("User registration completed successfully", new { userId = profile.Id });

                return new StepResult
                {
                    Success = true,
                    Data = new
                    {
                        userId = profile.Id,
                        message = "User registered successfully"
                    }
                };
            }
            catch (Exception ex)
            {
                context.Logger.Error("User registration failed", new { error = ex.Message, stack = ex.StackTrace });
                
                await context.Emit(new MotiaEvent
                {
                    Topic = "user.registration.failed",
                    Data = new MotiaError
                    {
                        Message = ex.Message,
                        Code = "REGISTRATION_ERROR"
                    }
                });

                return new StepResult
                {
                    Success = false,
                    Error = new MotiaError
                    {
                        Message = ex.Message,
                        Code = "REGISTRATION_ERROR"
                    }
                };
            }
        }

        private static UserData ParseUserData(object data)
        {
            // Implementation for parsing user data
            throw new NotImplementedException();
        }

        private static void ValidateUserData(UserData userData)
        {
            // Implementation for validation
            throw new NotImplementedException();
        }

        private static async Task<UserProfile> CreateUserProfile(UserData userData, MotiaContext context)
        {
            // Implementation for creating user profile
            throw new NotImplementedException();
        }

        private static async Task SendWelcomeEmail(UserData userData, MotiaContext context)
        {
            // Implementation for sending welcome email
            throw new NotImplementedException();
        }

        // Middleware
        public static async Task<object?> LoggingMiddleware(object? data, MotiaContext context, Func<Task<object?>> next)
        {
            var startTime = DateTime.UtcNow;
            var result = await next();
            var executionTime = DateTime.UtcNow - startTime;
            
            context.Logger.Info("UserRegistrationStep completed", new { executionTime });
            return result;
        }

        public static async Task<object?> ValidationMiddleware(object? data, MotiaContext context, Func<Task<object?>> next)
        {
            if (data == null)
            {
                throw new ArgumentException("User data is required");
            }
            return await next();
        }
    }

    // Data models
    public class UserData
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Age { get; set; }
    }

    public class UserProfile
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
```

## Next Steps

1. **Explore Examples**: Check out the examples in the `examples/` directory
2. **Run Tests**: Execute the test suite to verify everything works
3. **Build Your First Step**: Create a simple step following the patterns above
4. **Join the Community**: Connect with other Motia developers

## Support

If you need help or have questions:

1. Check the examples and documentation
2. Review the test files for usage patterns
3. Look at the existing C# steps in the playground
4. Open an issue on the Motia repository

Happy coding with Motia C#!
