config = {
    "type": "event",
    "name": "NewOrderNotifications",
    "description": "Checks a state change using python",
    "subscribes": ["new-order-notification"], 
    "emits": [],
    "flows": ["basic-tutorial"],
    "input": None,  # Replace with Pydantic model for validation
}

async def handler(input, ctx):
    ctx.logger.info('Processing NewOrderNotifications', input)
    ctx.logger.info('[NewOrderNotifications] order id', input.get('order_id'))

    value = await ctx.state.get('orders', input.get('order_id'))
    
    ctx.logger.info('New order notification sent using Python: ', {
        'order_id': input.get('order_id'),
        'value': value,
        'trace_id': ctx.trace_id
    })
