using MotiaCSharp.Types;

namespace MotiaCSharp.State
{
    public class MotiaStateManager : IMotiaState
    {
        private readonly IMotiaRpc _rpc;

        public MotiaStateManager(IMotiaRpc rpc)
        {
            _rpc = rpc;
        }

        public async Task<T?> Get<T>(string traceId, string key)
        {
            var input = new { traceId, key };
            return await _rpc.SendAsync<T>("state.get", input);
        }

        public async Task Set<T>(string traceId, string key, T value)
        {
            var input = new { traceId, key, value };
            await _rpc.SendAsync("state.set", input);
        }

        public async Task Delete(string traceId, string key)
        {
            var input = new { traceId, key };
            await _rpc.SendAsync("state.delete", input);
        }

        public async Task Clear(string traceId)
        {
            var input = new { traceId };
            await _rpc.SendAsync("state.clear", input);
        }

        public async Task<Dictionary<string, object>> GetAll(string traceId)
        {
            var input = new { traceId };
            return await _rpc.SendAsync<Dictionary<string, object>>("state.getAll", input) ?? new Dictionary<string, object>();
        }

        public async Task<bool> Exists(string traceId, string key)
        {
            var input = new { traceId, key };
            return await _rpc.SendAsync<bool>("state.exists", input);
        }
    }
}
