from typing import Dict, Callable, Any, Literal
# {{imports}}

# Generated code should look like this:
# from my_step import my_api_handler
# 
# router_paths: Dict[str, RouterPath] = {
#     "my_step": RouterPath(
#         step_name="my_step",
#         method="post",
#         handler=my_api_handler,
#         config={"timeout": 30}
#     )
# }

class RouterPath:
    def __init__(self, step_name: str, method: Literal['get', 'post', 'put', 'delete', 'patch', 'options', 'head'], handler: Callable, config: Dict[str, Any]):
        self.step_name = step_name
        self.method = method
        self.handler = handler
        self.config = config

router_paths: Dict[str, RouterPath] = {
    # {{router paths}}
}
