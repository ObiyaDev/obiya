using MotiaCSharp.Types;

namespace MotiaCSharp.Logging
{
    public class MotiaLogger : IMotiaLogger
    {
        private readonly IMotiaRpc _rpc;
        private readonly string _traceId;
        private readonly string[] _flows;

        public MotiaLogger(IMotiaRpc rpc, string traceId, string[] flows)
        {
            _rpc = rpc;
            _traceId = traceId;
            _flows = flows;
        }

        public void Debug(string message, object? data = null)
        {
            Log("debug", message, data);
        }

        public void Info(string message, object? data = null)
        {
            Log("info", message, data);
        }

        public void Warn(string message, object? data = null)
        {
            Log("warn", message, data);
        }

        public void Error(string message, object? data = null)
        {
            Log("error", message, data);
        }

        private void Log(string level, string message, object? data)
        {
            var logData = new
            {
                level,
                message,
                data,
                traceId = _traceId,
                flows = _flows
            };

            _rpc.SendNoWait("log", logData);
        }
    }
}
