using MotiaCSharp.Types;

namespace MotiaCSharp.Middleware
{
    public delegate Task<object?> MiddlewareFunction(object? data, MotiaContext context, Func<Task<object?>> next);

    public static class MotiaMiddleware
    {
        public static MiddlewareFunction Compose(params MiddlewareFunction[] middlewares)
        {
            if (middlewares == null || middlewares.Length == 0)
            {
                return async (data, context, next) => await next();
            }

            return async (data, context, next) =>
            {
                var index = 0;

                async Task<object?> ExecuteNext()
                {
                    if (index >= middlewares.Length)
                    {
                        return await next();
                    }

                    var currentMiddleware = middlewares[index];
                    index++;

                    return await currentMiddleware(data, context, ExecuteNext);
                };

                return await ExecuteNext();
            };
        }
    }
}
