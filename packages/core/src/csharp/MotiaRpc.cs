using System.Text.Json;
using MotiaCSharp.Types;

namespace MotiaCSharp.Communication
{
    public class MotiaRpc : IMotiaRpc, IDisposable
    {
        private readonly Stream _stdin;
        private readonly Stream _stdout;
        private readonly Stream _stderr;
        private readonly Dictionary<string, TaskCompletionSource<object?>> _pendingRequests = new();
        private readonly object _lock = new();
        private int _requestId = 0;
        private bool _disposed = false;

        public MotiaRpc()
        {
            _stdin = Console.OpenStandardInput();
            _stdout = Console.OpenStandardOutput();
            _stderr = Console.OpenStandardError();
        }

        public async Task<T?> SendAsync<T>(string method, object? data = null)
        {
            var requestId = Interlocked.Increment(ref _requestId);
            var tcs = new TaskCompletionSource<object?>();
            
            lock (_lock)
            {
                _pendingRequests[requestId.ToString()] = tcs;
            }

            var request = new
            {
                id = requestId.ToString(),
                method,
                data
            };

            var json = JsonSerializer.Serialize(request);
            await _stdout.WriteAsync(System.Text.Encoding.UTF8.GetBytes(json + "\n"));
            await _stdout.FlushAsync();

            var result = await tcs.Task;
            return result != null ? JsonSerializer.Deserialize<T>(JsonSerializer.Serialize(result)) : default;
        }

        public async Task SendAsync(string method, object? data = null)
        {
            await SendAsync<object>(method, data);
        }

        public void SendNoWait(string method, object? data = null)
        {
            _ = Task.Run(async () => await SendAsync(method, data));
        }

        public void Close()
        {
            Dispose();
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _stdin?.Dispose();
                _stdout?.Dispose();
                _stderr?.Dispose();
                _disposed = true;
            }
        }

        public async Task StartListening()
        {
            var buffer = new byte[4096];
            var stream = Console.OpenStandardInput();

            while (!_disposed)
            {
                try
                {
                    var bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);
                    if (bytesRead == 0) break;

                    var json = System.Text.Encoding.UTF8.GetString(buffer, 0, bytesRead);
                    var lines = json.Split('\n', StringSplitOptions.RemoveEmptyEntries);

                    foreach (var line in lines)
                    {
                        if (string.IsNullOrWhiteSpace(line)) continue;

                        try
                        {
                            var response = JsonSerializer.Deserialize<JsonElement>(line);
                            
                            if (response.TryGetProperty("id", out var idElement) && 
                                response.TryGetProperty("result", out var resultElement))
                            {
                                var id = idElement.GetString();
                                if (id != null && _pendingRequests.TryGetValue(id, out var tcs))
                                {
                                    lock (_lock)
                                    {
                                        _pendingRequests.Remove(id);
                                    }
                                    tcs.SetResult(resultElement.GetRawText());
                                }
                            }
                        }
                        catch (JsonException ex)
                        {
                            await _stderr.WriteAsync(System.Text.Encoding.UTF8.GetBytes($"Error parsing JSON: {ex.Message}\n"));
                        }
                    }
                }
                catch (Exception ex)
                {
                    await _stderr.WriteAsync(System.Text.Encoding.UTF8.GetBytes($"Error reading from stdin: {ex.Message}\n"));
                    break;
                }
            }
        }
    }
}
