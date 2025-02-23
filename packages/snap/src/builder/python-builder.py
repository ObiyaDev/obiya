import os
import sys
import json
import modulegraph.modulegraph

NODEIPCFD = int(os.environ["NODE_CHANNEL_FD"])

def trace_imports(entry_file):
    """Find all imported Python files starting from an entry file."""
    graph = modulegraph.modulegraph.ModuleGraph()
    graph.run_script(entry_file)

    files = set()
    for mod in graph.nodes():  # Changed from iter_modules() to iter_graph()
        if mod.filename and mod.filename.endswith(".py"):
            files.add(os.path.abspath(mod.filename))

    return list(files)

if __name__ == "__main__":
    entry_file = sys.argv[1]  # Get entrypoint from CLI args
    files = trace_imports(entry_file)
    bytes_message = (json.dumps(files) + '\n').encode('utf-8')
    os.write(NODEIPCFD, bytes_message)
