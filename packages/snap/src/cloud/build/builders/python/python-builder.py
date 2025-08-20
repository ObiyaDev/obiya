import os
import sys
import json
import importlib.util
import traceback
import site
import builtins
import ast
import importlib.metadata
import subprocess
import re
from typing import Set, List, Tuple, Optional, Dict, Any
from pathlib import Path
from functools import lru_cache

from trace_packages import trace_packages
from trace_project_files import trace_project_files

NODEIPCFD = int(os.environ.get("NODE_CHANNEL_FD", 0))

def main() -> None:
    """Main entry point for the script."""
    if len(sys.argv) != 3:
        print("Usage: python python-builder.py <project_dir> <entry_file>")
        sys.exit(1)

    project_dir = sys.argv[1]
    entry_file = sys.argv[2]

    try:
        # Find project dependencies
        packages = trace_packages(project_dir, entry_file)
        files = trace_project_files(project_dir, entry_file)
        
        # Prepare output
        output = {
            'packages': packages,
            'files': files,
        }
        
        # Output as JSON
        bytes_message = (json.dumps(output) + '\n').encode('utf-8')
        if NODEIPCFD > 0:
            os.write(NODEIPCFD, bytes_message)
        else:
            print(bytes_message)
        sys.exit(0)
    except Exception as e:
        sys.exit(2)

if __name__ == "__main__":
    main()
