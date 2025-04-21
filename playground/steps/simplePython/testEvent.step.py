config = {
    "type": "event",
    "name": "Test Event",
    "subscribes": ["test"],
    "emits": ["tested"],
    "input": None,  # No schema validation in Python version
    "flows": ["simple-python"]
}

async def handler(input, context):
    context.logger.info("this is a test", input)

    await context.emit({
        "topic": "tested",
        "data": { "message": "hello world" }
    })