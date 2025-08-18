using System.Text.Json.Serialization;

namespace MotiaCSharp.Types
{
    public class MotiaConfig
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("emits")]
        public string[]? Emits { get; set; }

        [JsonPropertyName("subscribes")]
        public string[]? Subscribes { get; set; }

        [JsonPropertyName("flows")]
        public string[]? Flows { get; set; }

        [JsonPropertyName("middleware")]
        public object[]? Middleware { get; set; }

        [JsonPropertyName("path")]
        public string? Path { get; set; }

        [JsonPropertyName("method")]
        public string? Method { get; set; }

        [JsonPropertyName("bodySchema")]
        public JsonSchema? BodySchema { get; set; }

        [JsonPropertyName("responseSchema")]
        public JsonSchema? ResponseSchema { get; set; }

        [JsonPropertyName("virtualSubscribes")]
        public string[]? VirtualSubscribes { get; set; }

        [JsonPropertyName("cron")]
        public string? Cron { get; set; }

        [JsonPropertyName("timeout")]
        public int? Timeout { get; set; }

        [JsonPropertyName("retries")]
        public int? Retries { get; set; }

        [JsonPropertyName("parallel")]
        public bool? Parallel { get; set; }
    }

    // JSON Schema types for validation
    public abstract class JsonSchema
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }

    public class JsonStringSchema : JsonSchema
    {
        public JsonStringSchema()
        {
            Type = "string";
        }

        [JsonPropertyName("enum")]
        public string[]? Enum { get; set; }

        [JsonPropertyName("pattern")]
        public string? Pattern { get; set; }

        [JsonPropertyName("minLength")]
        public int? MinLength { get; set; }

        [JsonPropertyName("maxLength")]
        public int? MaxLength { get; set; }
    }

    public class JsonNumberSchema : JsonSchema
    {
        public JsonNumberSchema()
        {
            Type = "number";
        }

        [JsonPropertyName("minimum")]
        public double? Minimum { get; set; }

        [JsonPropertyName("maximum")]
        public double? Maximum { get; set; }

        [JsonPropertyName("exclusiveMinimum")]
        public bool? ExclusiveMinimum { get; set; }

        [JsonPropertyName("exclusiveMaximum")]
        public bool? ExclusiveMaximum { get; set; }
    }

    public class JsonBooleanSchema : JsonSchema
    {
        public JsonBooleanSchema()
        {
            Type = "boolean";
        }
    }

    public class JsonArraySchema : JsonSchema
    {
        public JsonArraySchema()
        {
            Type = "array";
        }

        [JsonPropertyName("items")]
        public JsonSchema Items { get; set; } = null!;

        [JsonPropertyName("minItems")]
        public int? MinItems { get; set; }

        [JsonPropertyName("maxItems")]
        public int? MaxItems { get; set; }

        [JsonPropertyName("uniqueItems")]
        public bool? UniqueItems { get; set; }
    }

    public class JsonObjectSchema : JsonSchema
    {
        public JsonObjectSchema()
        {
            Type = "object";
        }

        [JsonPropertyName("properties")]
        public Dictionary<string, JsonSchema> Properties { get; set; } = new();

        [JsonPropertyName("required")]
        public string[]? Required { get; set; }

        [JsonPropertyName("additionalProperties")]
        public JsonSchema? AdditionalProperties { get; set; }

        [JsonPropertyName("minProperties")]
        public int? MinProperties { get; set; }

        [JsonPropertyName("maxProperties")]
        public int? MaxProperties { get; set; }
    }

    public class MotiaContext
    {
        [JsonPropertyName("traceId")]
        public string TraceId { get; set; } = string.Empty;

        [JsonPropertyName("flows")]
        public string[] Flows { get; set; } = Array.Empty<string>();

        [JsonPropertyName("state")]
        public IMotiaState State { get; set; } = null!;

        [JsonPropertyName("logger")]
        public IMotiaLogger Logger { get; set; } = null!;

        [JsonPropertyName("streams")]
        public dynamic Streams { get; set; } = null!;

        [JsonPropertyName("emit")]
        public Func<MotiaEvent, Task> Emit { get; set; } = null!;
    }

    public class MotiaEvent
    {
        [JsonPropertyName("topic")]
        public string Topic { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public object? Data { get; set; }

        [JsonPropertyName("metadata")]
        public Dictionary<string, object>? Metadata { get; set; }
    }

    public class MotiaError
    {
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("code")]
        public string? Code { get; set; }

        [JsonPropertyName("stack")]
        public string? Stack { get; set; }

        [JsonPropertyName("details")]
        public object? Details { get; set; }
    }

    public interface IMotiaState
    {
        Task<T?> Get<T>(string traceId, string key);
        Task Set<T>(string traceId, string key, T value);
        Task Delete(string traceId, string key);
        Task Clear(string traceId);
        Task<Dictionary<string, object>> GetAll(string traceId);
        Task<bool> Exists(string traceId, string key);
    }

    public interface IMotiaLogger
    {
        void Debug(string message, object? data = null);
        void Info(string message, object? data = null);
        void Warn(string message, object? data = null);
        void Error(string message, object? data = null);
        void Trace(string message, object? data = null);
        void Fatal(string message, object? data = null);
    }

    public class MotiaStreamManager
    {
        private readonly string _name;
        private readonly IMotiaRpc _rpc;

        public MotiaStreamManager(string name, IMotiaRpc rpc)
        {
            _name = name;
            _rpc = rpc;
        }

        public async Task<T?> Get<T>(string groupId, string id)
        {
            return await _rpc.SendAsync<T>($"streams.{_name}.get", new { groupId, id });
        }

        public async Task Set<T>(string groupId, string id, T data)
        {
            await _rpc.SendAsync($"streams.{_name}.set", new { groupId, id, data });
        }

        public async Task Delete(string groupId, string id)
        {
            await _rpc.SendAsync($"streams.{_name}.delete", new { groupId, id });
        }

        public async Task<T?> GetGroup<T>(string groupId)
        {
            return await _rpc.SendAsync<T>($"streams.{_name}.getGroup", new { groupId });
        }

        public async Task<Dictionary<string, T>> GetAllInGroup<T>(string groupId)
        {
            return await _rpc.SendAsync<Dictionary<string, T>>($"streams.{_name}.getAllInGroup", new { groupId });
        }

        public async Task ClearGroup(string groupId)
        {
            await _rpc.SendAsync($"streams.{_name}.clearGroup", new { groupId });
        }
    }

    public interface IMotiaRpc
    {
        Task<T?> SendAsync<T>(string method, object? data = null);
        Task SendAsync(string method, object? data = null);
        void SendNoWait(string method, object? data = null);
        void Close();
    }

    // Step execution result types
    public class StepResult<T>
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("data")]
        public T? Data { get; set; }

        [JsonPropertyName("error")]
        public MotiaError? Error { get; set; }

        [JsonPropertyName("metadata")]
        public Dictionary<string, object>? Metadata { get; set; }
    }

    public class StepResult : StepResult<object>
    {
    }
}
