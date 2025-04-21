from pydantic import BaseModel
from typing import List

class EnrichedItem(BaseModel):
    enriched_by: str
    processed_at: str
    # Include other fields that might be in the item
    value: float  # Based on the usage in the analysis

class InputSchema(BaseModel):
    items: List[EnrichedItem]
    timestamp: str

config = {
    "type": "event",
    "name": "Analyze Data",
    "subscribes": ["hybrid.enriched"],
    "emits": ["hybrid.analyzed"],
    "input": InputSchema.model_json_schema(),
    "flows": ["hybrid-example"]
}

async def handler(input, context):
    context.logger.info("[Analyze Data] Received hybrid.enriched event", {
        "input": input,
    })

    items = input.get('items')
    # Calculate some statistics
    total_items = len(items)
    total = sum(item.get('value', 0) for item in items)
    average = total / total_items if items else 0
    
    analysis = {
        "total": total,
        "average": average,
        "count": total_items,
        "analyzed_by": "python"
    }

    context.logger.info("[Analyze Data] Received hybrid.enriched event", {
        "analysis": analysis,
        "timestamp": input.get('timestamp')
    })
    
    # Convert items to a JSON serializable format
    serializable_items = [item.__dict__ for item in items]

    await context.emit({
        "topic": "hybrid.analyzed",
        "data": {
            "items": serializable_items,
            "analysis": analysis,
            "timestamp": input.get('timestamp')
        }
    })