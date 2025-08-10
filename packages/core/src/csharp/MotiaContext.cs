using MotiaCSharp.Types;
using MotiaCSharp.State;
using MotiaCSharp.Logging;
using MotiaCSharp.Communication;

namespace MotiaCSharp
{
    public class MotiaContext : MotiaCSharp.Types.MotiaContext
    {
        public MotiaContext(IMotiaRpc rpc, string traceId, string[] flows, dynamic streams)
        {
            TraceId = traceId;
            Flows = flows;
            State = new MotiaStateManager(rpc);
            Logger = new MotiaLogger(rpc, traceId, flows);
            Streams = streams;
            Emit = async (eventData) => await rpc.SendAsync("emit", eventData);
        }
    }
}
