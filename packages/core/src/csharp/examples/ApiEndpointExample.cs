using MotiaCSharp.Types;
using MotiaCSharp;
using System.Text.Json;

namespace MotiaCSharp.Examples
{
    /// <summary>
    /// API Endpoint example demonstrating HTTP request/response handling
    /// </summary>
    public class ApiEndpointExample
    {
        public static MotiaConfig config = new MotiaConfig
        {
            Type = "api",
            Name = "API Endpoint Example",
            Description = "Demonstrates API endpoint handling with validation, authentication, and response formatting",
            Path = "/api/example",
            Method = "POST",
            Flows = new[] { "api-demo" },
            BodySchema = new JsonObjectSchema
            {
                Properties = new Dictionary<string, JsonSchema>
                {
                    ["name"] = new JsonStringSchema
                    {
                        MinLength = 1,
                        MaxLength = 100,
                        Description = "User's full name"
                    },
                    ["email"] = new JsonStringSchema
                    {
                        Pattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
                        Description = "Valid email address"
                    },
                    ["age"] = new JsonNumberSchema
                    {
                        Minimum = 13,
                        Maximum = 120,
                        Description = "User's age (must be 13+)"
                    },
                    ["preferences"] = new JsonObjectSchema
                    {
                        Properties = new Dictionary<string, JsonSchema>
                        {
                            ["newsletter"] = new JsonBooleanSchema(),
                            ["notifications"] = new JsonBooleanSchema()
                        },
                        AdditionalProperties = false
                    }
                },
                Required = new[] { "name", "email" }
            },
            ResponseSchema = new JsonObjectSchema
            {
                Properties = new Dictionary<string, JsonSchema>
                {
                    ["success"] = new JsonBooleanSchema(),
                    ["message"] = new JsonStringSchema(),
                    ["data"] = new JsonObjectSchema
                    {
                        Properties = new Dictionary<string, JsonSchema>
                        {
                            ["userId"] = new JsonStringSchema(),
                            ["createdAt"] = new JsonStringSchema(),
                            ["status"] = new JsonStringSchema()
                        }
                    },
                    ["errors"] = new JsonArraySchema
                    {
                        Items = new JsonObjectSchema
                        {
                            Properties = new Dictionary<string, JsonSchema>
                            {
                                ["field"] = new JsonStringSchema(),
                                ["message"] = new JsonStringSchema()
                            }
                        }
                    }
                }
            },
            Middleware = new object[] { AuthenticationMiddleware, RateLimitingMiddleware },
            Timeout = 15000,
            Retries = 2
        };

        public static async Task<object> handler(object data, MotiaContext context)
        {
            try
            {
                context.Logger.Info("API endpoint called", new { data, traceId = context.TraceId });

                // Parse and validate request data
                var request = await ParseAndValidateRequest(data, context);
                if (request == null)
                {
                    return CreateErrorResponse("Invalid request data", 400);
                }

                // Process the request
                var result = await ProcessRequest(request, context);

                // Store result in state for potential future use
                await context.State.Set(context.TraceId, "lastApiCall", new
                {
                    timestamp = DateTime.UtcNow,
                    request = request,
                    result = result
                });

                // Emit event for successful API call
                await context.Emit(new MotiaEvent
                {
                    Topic = "api-call-successful",
                    Data = new
                    {
                        endpoint = config.Path,
                        method = config.Method,
                        userId = result.UserId,
                        timestamp = DateTime.UtcNow
                    }
                });

                context.Logger.Info("API request processed successfully", new { userId = result.UserId });

                return CreateSuccessResponse(result);
            }
            catch (ValidationException ex)
            {
                context.Logger.Warn("Validation error in API endpoint", new { error = ex.Message, field = ex.Field });
                return CreateErrorResponse(ex.Message, 400, new[] { new ValidationError { Field = ex.Field, Message = ex.Message } });
            }
            catch (AuthenticationException ex)
            {
                context.Logger.Warn("Authentication error in API endpoint", new { error = ex.Message });
                return CreateErrorResponse(ex.Message, 401);
            }
            catch (Exception ex)
            {
                context.Logger.Error("Unexpected error in API endpoint", new { error = ex.Message, stack = ex.StackTrace });

                // Emit error event
                await context.Emit(new MotiaEvent
                {
                    Topic = "api-call-failed",
                    Data = new MotiaError
                    {
                        Message = ex.Message,
                        Code = "API_ENDPOINT_ERROR",
                        Stack = ex.StackTrace
                    }
                });

                return CreateErrorResponse("Internal server error", 500);
            }
        }

        private static async Task<ApiRequest?> ParseAndValidateRequest(object data, MotiaContext context)
        {
            try
            {
                if (data == null)
                {
                    throw new ValidationException("Request data is required", "body");
                }

                // In a real implementation, you would use a proper JSON deserializer
                // For this example, we'll simulate parsing
                var jsonString = JsonSerializer.Serialize(data);
                var request = JsonSerializer.Deserialize<ApiRequest>(jsonString);

                if (request == null)
                {
                    throw new ValidationException("Failed to parse request data", "body");
                }

                // Validate required fields
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    throw new ValidationException("Name is required", "name");
                }

                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    throw new ValidationException("Email is required", "email");
                }

                // Validate email format
                if (!IsValidEmail(request.Email))
                {
                    throw new ValidationException("Invalid email format", "email");
                }

                // Validate age if provided
                if (request.Age.HasValue && (request.Age < 13 || request.Age > 120))
                {
                    throw new ValidationException("Age must be between 13 and 120", "age");
                }

                return request;
            }
            catch (JsonException ex)
            {
                context.Logger.Error("JSON parsing error", new { error = ex.Message });
                throw new ValidationException("Invalid JSON format", "body");
            }
        }

        private static async Task<ApiResult> ProcessRequest(ApiRequest request, MotiaContext context)
        {
            // Simulate some processing time
            await Task.Delay(100);

            // Generate a unique user ID
            var userId = Guid.NewGuid().ToString();

            // Store user data in streams if available
            if (context.Streams != null)
            {
                try
                {
                    var userStream = context.Streams.user;
                    if (userStream != null)
                    {
                        await userStream.Set("users", userId, new
                        {
                            id = userId,
                            name = request.Name,
                            email = request.Email,
                            age = request.Age,
                            preferences = request.Preferences,
                            createdAt = DateTime.UtcNow,
                            status = "active"
                        });
                    }
                }
                catch (Exception ex)
                {
                    context.Logger.Warn("Failed to store user in stream", new { error = ex.Message });
                }
            }

            return new ApiResult
            {
                UserId = userId,
                Status = "created",
                Message = $"User {request.Name} created successfully"
            };
        }

        private static object CreateSuccessResponse(ApiResult result)
        {
            return new
            {
                success = true,
                message = result.Message,
                data = new
                {
                    userId = result.UserId,
                    createdAt = DateTime.UtcNow.ToString("O"),
                    status = result.Status
                }
            };
        }

        private static object CreateErrorResponse(string message, int statusCode, ValidationError[]? errors = null)
        {
            var response = new
            {
                success = false,
                message = message,
                statusCode = statusCode
            };

            if (errors != null && errors.Length > 0)
            {
                return new
                {
                    success = false,
                    message = message,
                    statusCode = statusCode,
                    errors = errors
                };
            }

            return response;
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        // Middleware Examples
        public static async Task<object?> AuthenticationMiddleware(object? data, MotiaContext context, Func<Task<object?>> next)
        {
            context.Logger.Info("AuthenticationMiddleware: Checking authentication");

            // In a real implementation, you would check JWT tokens, API keys, etc.
            // For this example, we'll simulate authentication
            if (data != null)
            {
                var dataDict = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(data));
                if (dataDict != null && dataDict.ContainsKey("apiKey"))
                {
                    var apiKey = dataDict["apiKey"]?.ToString();
                    if (string.IsNullOrEmpty(apiKey) || apiKey != "valid-api-key")
                    {
                        throw new AuthenticationException("Invalid API key");
                    }
                }
                else
                {
                    throw new AuthenticationException("API key is required");
                }
            }

            context.Logger.Info("AuthenticationMiddleware: Authentication successful");
            return await next();
        }

        public static async Task<object?> RateLimitingMiddleware(object? data, MotiaContext context, Func<Task<object?>> next)
        {
            context.Logger.Info("RateLimitingMiddleware: Checking rate limits");

            // In a real implementation, you would check rate limits from Redis or similar
            // For this example, we'll simulate rate limiting
            var rateLimitKey = $"rate_limit:{context.TraceId}";
            var currentCount = await context.State.Get<int>(context.TraceId, rateLimitKey) ?? 0;

            if (currentCount >= 10) // Max 10 requests per minute
            {
                throw new InvalidOperationException("Rate limit exceeded. Please try again later.");
            }

            // Increment rate limit counter
            await context.State.Set(context.TraceId, rateLimitKey, currentCount + 1);

            context.Logger.Info("RateLimitingMiddleware: Rate limit check passed");
            return await next();
        }
    }

    // Data Models
    public class ApiRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int? Age { get; set; }
        public UserPreferences? Preferences { get; set; }
    }

    public class UserPreferences
    {
        public bool Newsletter { get; set; }
        public bool Notifications { get; set; }
    }

    public class ApiResult
    {
        public string UserId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class ValidationError
    {
        public string Field { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    // Custom Exceptions
    public class ValidationException : Exception
    {
        public string Field { get; }

        public ValidationException(string message, string field) : base(message)
        {
            Field = field;
        }
    }

    public class AuthenticationException : Exception
    {
        public AuthenticationException(string message) : base(message)
        {
        }
    }
}
