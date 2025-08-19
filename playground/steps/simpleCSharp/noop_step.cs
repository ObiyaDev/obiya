using System;
using System.Threading.Tasks;

// Configuration for the NOOP Step
public class Config
{
    public string Type { get; set; } = "noop";
    public string Name { get; set; } = "ManualApprovalStep";
    public string Description { get; set; } = "Represents a manual approval process that requires human intervention";
    public string[] VirtualEmits { get; set; } = { "approval.granted", "approval.denied", "approval.pending" };
    public string[] VirtualSubscribes { get; set; } = { "approval.requested" };
    public string[] Flows { get; set; } = { "approval-workflow", "human-in-the-loop" };
}

// Handler for the NOOP Step - minimal logic since it's primarily for visualization
public class Handler
{
    public static async Task<object> Execute(MotiaContext context, object input)
    {
        await context.Logger.Info("NOOP Step executed - Manual approval required", new { 
            traceId = context.TraceId,
            stepType = "noop",
            stepName = "ManualApprovalStep"
        });
        
        // Store the approval request in state for manual review
        var approvalRequest = new
        {
            id = Guid.NewGuid().ToString(),
            status = "pending",
            requestedAt = DateTime.UtcNow,
            requestedBy = "system",
            input = input,
            traceId = context.TraceId
        };
        
        await context.State.Set(context.TraceId, "approval.request", approvalRequest);
        
        // Log that manual intervention is required
        await context.Logger.Warn("Manual approval required - step will remain pending until human intervention", new
        {
            approvalId = approvalRequest.id,
            status = "pending"
        });
        
        // Return information about the pending approval
        return new
        {
            type = "noop",
            status = "pending",
            message = "Manual approval required - this step represents a human-in-the-loop process",
            approvalRequest = approvalRequest,
            nextSteps = new[]
            {
                "Wait for human approval",
                "Approval can be granted via external system",
                "Approval can be denied via external system",
                "Step will remain pending until resolved"
            },
            timestamp = DateTime.UtcNow
        };
    }
}
