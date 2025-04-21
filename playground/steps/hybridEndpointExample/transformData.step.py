from pydantic import BaseModel
from typing import List

class Item(BaseModel):
    id: int
    value: float

class InputSchema(BaseModel):
    items: List[Item]
    timestamp: str 

config = {
    "type": "event",
    "name": "Transform Data", 
    "subscribes": ["hybrid.validated"],
    "emits": ["hybrid.transformed"],
    "input": InputSchema.model_json_schema(),
    "flows": ["hybrid-example"]
}

async def handler(input, context):
    context.logger.info("Received input", input)

    items = input.get("items")
    # Transform each item
    transformed = [
        {
            "id": item.get("id"),
            "value": item.get("value", 0) * 2,
            "transformed_by": "python"
        } for item in items
    ]
    
    await context.emit({
        "topic": "hybrid.transformed",
        "data": {
            "items": transformed,
            "timestamp": input.get("timestamp")
        }
    })