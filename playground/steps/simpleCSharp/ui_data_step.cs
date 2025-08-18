using System;
using System.Threading.Tasks;
using System.Collections.Generic;

// Configuration for the UI Data Step
public class Config
{
    public string Type { get; set; } = "event";
    public string Name { get; set; } = "UIDataGenerator";
    public string Description { get; set; } = "Generates UI data and configurations for dashboard components";
    public string[] Subscribes { get; set; } = { "ui.refresh", "dashboard.update" };
    public string[] Emits { get; set; } = { "ui.data.ready", "chart.data.updated", "metrics.displayed" };
    public string[] Flows { get; set; } = { "ui-dashboard", "data-visualization" };
}

// Handler that generates UI data and configurations
public class Handler
{
    public static async Task<object> Execute(MotiaContext context, object input)
    {
        await context.Logger.Info("UI Data generation started", new { 
            traceId = context.TraceId,
            input = input
        });
        
        try
        {
            // Generate different types of UI data based on the input
            var uiData = await GenerateUIData(context, input);
            
            // Store the UI data in state for persistence
            await context.State.Set(context.TraceId, "ui.data", uiData);
            
            // Emit the UI data ready event
            await context.Emit(new
            {
                topic = "ui.data.ready",
                data = new
                {
                    traceId = context.TraceId,
                    uiData,
                    timestamp = DateTime.UtcNow,
                    source = "C# UI Data Generator"
                }
            });
            
            // Generate chart-specific data
            var chartData = await GenerateChartData(context);
            await context.Emit(new
            {
                topic = "chart.data.updated",
                data = new
                {
                    traceId = context.TraceId,
                    chartData,
                    timestamp = DateTime.UtcNow
                }
            });
            
            // Generate metrics data
            var metricsData = await GenerateMetricsData(context);
            await context.Emit(new
            {
                topic = "metrics.displayed",
                data = new
                {
                    traceId = context.TraceId,
                    metricsData,
                    timestamp = DateTime.UtcNow
                }
            });
            
            await context.Logger.Info("UI Data generation completed successfully", new { 
                traceId = context.TraceId,
                dataTypes = new[] { "ui", "chart", "metrics" }
            });
            
            return new
            {
                success = true,
                message = "UI data generated successfully",
                data = uiData,
                charts = chartData,
                metrics = metricsData,
                timestamp = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            await context.Logger.Error("UI Data generation failed", new { 
                traceId = context.TraceId,
                error = ex.Message 
            });
            throw;
        }
    }
    
    private static async Task<object> GenerateUIData(MotiaContext context, object input)
    {
        await context.Logger.Debug("Generating UI data...");
        
        // Simulate UI data generation
        await Task.Delay(50);
        
        var uiData = new
        {
            dashboard = new
            {
                title = "C# Generated Dashboard",
                theme = "dark",
                layout = "grid",
                components = new[]
                {
                    new { id = "chart1", type = "line-chart", position = "top-left", size = "medium" },
                    new { id = "chart2", type = "bar-chart", position = "top-right", size = "medium" },
                    new { id = "metrics", type = "metrics-panel", position = "bottom", size = "large" },
                    new { id = "table", type = "data-table", position = "center", size = "large" }
                }
            },
            navigation = new
            {
                items = new[]
                {
                    new { id = "home", label = "Home", icon = "house", route = "/" },
                    new { id = "dashboard", label = "Dashboard", icon = "chart", route = "/dashboard" },
                    new { id = "analytics", label = "Analytics", icon = "analytics", route = "/analytics" },
                    new { id = "settings", label = "Settings", icon = "gear", route = "/settings" }
                }
            },
            userPreferences = new
            {
                language = "en",
                timezone = "UTC",
                dateFormat = "MM/dd/yyyy",
                numberFormat = "en-US"
            }
        };
        
        return uiData;
    }
    
    private static async Task<object> GenerateChartData(MotiaContext context)
    {
        await context.Logger.Debug("Generating chart data...");
        
        // Simulate chart data generation
        await Task.Delay(30);
        
        var chartData = new
        {
            lineChart = new
            {
                labels = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun" },
                datasets = new[]
                {
                    new
                    {
                        label = "Sales",
                        data = new[] { 65, 59, 80, 81, 56, 55 },
                        borderColor = "#3b82f6",
                        backgroundColor = "rgba(59, 130, 246, 0.1)"
                    },
                    new
                    {
                        label = "Revenue",
                        data = new[] { 28, 48, 40, 19, 86, 27 },
                        borderColor = "#10b981",
                        backgroundColor = "rgba(16, 185, 129, 0.1)"
                    }
                }
            },
            barChart = new
            {
                labels = new[] { "Q1", "Q2", "Q3", "Q4" },
                datasets = new[]
                {
                    new
                    {
                        label = "Performance",
                        data = new[] { 12, 19, 3, 5 },
                        backgroundColor = new[] { "#ef4444", "#f59e0b", "#3b82f6", "#10b981" }
                    }
                }
            }
        };
        
        return chartData;
    }
    
    private static async Task<object> GenerateMetricsData(MotiaContext context)
    {
        await context.Logger.Debug("Generating metrics data...");
        
        // Simulate metrics data generation
        await Task.Delay(25);
        
        var metricsData = new
        {
            kpis = new[]
            {
                new { name = "Total Users", value = 12543, change = "+12%", trend = "up" },
                new { name = "Active Sessions", value = 892, change = "+5%", trend = "up" },
                new { name = "Conversion Rate", value = "3.2%", change = "-0.5%", trend = "down" },
                new { name = "Revenue", value = "$45,230", change = "+18%", trend = "up" }
            },
            alerts = new[]
            {
                new { type = "warning", message = "High memory usage detected", severity = "medium" },
                new { type = "info", message = "Backup completed successfully", severity = "low" },
                new { type = "error", message = "Database connection timeout", severity = "high" }
            },
            systemStatus = new
            {
                cpu = "45%",
                memory = "67%",
                disk = "23%",
                network = "12%"
            }
        };
        
        return metricsData;
    }
}
