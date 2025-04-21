config = {
    "type": "api",
    "name": "Test API Endpoint",
    "emits": ["test"],
    "flows": ["simple-python"],

    "path": "/test-python",
    "method": "POST",
}

async def handler(req, context):
    context.logger.info("this is a test", { "body": req.get("body"), "req": req })

    await context.emit({ "topic": "test", "data": req.get("body") })
    await context.state.set(context.trace_id, "message", "hello world")

    context.logger.info("State set", { "message": "hello world" })

    return {
        "status": 200,
        "body": { "message": "payload processed" }
    }
