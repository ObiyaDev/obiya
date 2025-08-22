from pydantic import BaseModel
from datetime import datetime
from .services.pet_store import pet_store_service

class InputSchema(BaseModel):
    email: str
    quantity: int
    pet_id: int

config = {
    "type": "event",
    "name": "PythonProcessFoodOrder",
    "description": "basic-tutorial event step, demonstrates how to consume an event from a topic and persist data in state",
    "flows": ["python-tutorial"],
    "subscribes": ["python-process-food-order"],
    "emits": ["python-notification"],
    "input": InputSchema.model_json_schema(),
}

async def handler(input_data, context):
    context.logger.info("Step 02 – Process food order", {"input": input_data})

    order = await pet_store_service.create_order({
        **input_data,
        "ship_date": datetime.now().isoformat(),
        "status": "placed",
    })

    await context.state.set("orders_python", order.id, order)

    await context.emit({
        "topic": "python-notification",
        "data": {
            "email": input_data["email"],
            "template_id": "new-order",
            "template_data": {
                "status": order.status,
                "ship_date": order.ship_date,
                "id": order.id,
                "pet_id": order.pet_id,
                "quantity": order.quantity,
            },
        },
    })
