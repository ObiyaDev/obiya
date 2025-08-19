# C# Language Support for Motia

This directory contains the C# language integration for Motia, allowing you to write workflow steps in C#.

## Overview

The C# integration provides:
- **Type Definitions**: C# equivalents of Motia's TypeScript types
- **RPC Communication**: Inter-process communication with the Motia core
- **State Management**: Access to Motia's state system
- **Logging**: Structured logging integration
- **Stream Management**: Access to Motia's stream system
- **Middleware Support**: Middleware composition for steps

## Requirements

- .NET 8.0 SDK or later
- The C# project will be built and executed by the Motia core

## Architecture

### Core Components

1. **CSharpRunner.cs** - Main entry point that loads and executes C# step files
2. **MotiaTypes.cs** - Type definitions for Motia configuration and context
3. **MotiaRpc.cs** - RPC communication system
4. **MotiaStateManager.cs** - State management interface
5. **MotiaLogger.cs** - Logging interface
6. **MotiaContext.cs** - Context object providing access to all Motia services
7. **MotiaMiddleware.cs** - Middleware composition system

### Communication Flow

```
Motia Core <-> JSON RPC <-> C# Runner <-> C# Step File
```

## Writing C# Steps

### Basic Structure

```csharp
using MotiaCSharp.Types;
using MotiaCSharp;

public class MyStep
{
    public static MotiaConfig config = new MotiaConfig
    {
        Type = "event",
        Name = "My C# Step",
        Subscribes = new[] { "my-topic" },
        Flows = new[] { "my-flow" }
    };

    public static async Task<object> handler(object data, MotiaContext context)
    {
        context.Logger.Info("Processing step", new { data });
        
        // Your step logic here
        
        return new { success = true };
    }
}
```

### Step Types

- **API Steps**: Handle HTTP requests
- **Event Steps**: Process events from topics
- **Cron Steps**: Scheduled execution
- **UI Steps**: Custom UI components

### Available Services

- **context.State**: Access to Motia's state system
- **context.Logger**: Structured logging
- **context.Emit**: Emit new events
- **context.Streams**: Access to stream data

### Middleware

```csharp
public static async Task<object> MyMiddleware(object data, MotiaContext context, Func<Task<object?>> next)
{
    context.Logger.Info("Before execution");
    var result = await next();
    context.Logger.Info("After execution");
    return result;
}

// Use in config
public static MotiaConfig config = new MotiaConfig
{
    // ... other config
    Middleware = new object[] { MyMiddleware }
};
```

## Building and Testing

The C# integration is automatically built and deployed with the Motia core. To test locally:

1. Navigate to the csharp directory
2. Run `dotnet build` to verify compilation
3. Run `dotnet run` to test the runner

## Examples

See the `playground/steps/simpleCSharp/` directory for working examples of C# steps.

## Troubleshooting

### Common Issues

1. **Assembly Loading**: Ensure your step file compiles to a valid .NET assembly
2. **RPC Communication**: Check that JSON is properly formatted for communication
3. **Type Mismatches**: Verify your step follows the expected Motia step structure

### Debugging

- Use `context.Logger.Debug()` for detailed logging
- Check the Motia core logs for RPC communication issues
- Verify .NET version compatibility

## Contributing

When adding new features to the C# integration:

1. Follow the existing code patterns
2. Add appropriate error handling
3. Include unit tests for new functionality
4. Update this documentation
5. Ensure backward compatibility
