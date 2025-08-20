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

NODEIPCFD = int(os.environ["NODE_CHANNEL_FD"])

# Cache for built-in modules to avoid repeated checks
_builtin_modules_cache: Set[str] = set()

@lru_cache(maxsize=1024)
def is_valid_package_name(name: str) -> bool:
    """Check if a name is a valid package name."""
    if not name or name.startswith('_'):
        return False
    
    # Skip common special cases
    invalid_names = {'__main__', 'module', 'cython_runtime', 'builtins'}
    return name not in invalid_names

@lru_cache(maxsize=1024)
def get_package_name(module_name: str) -> str:
    """Get the top-level package name from a module name."""
    return module_name.split('.')[0]

@lru_cache(maxsize=1024)
def clean_package_name(package_name: str) -> str:
    """Clean package name by removing version specifiers and other metadata."""
    # Remove version specifiers and conditions using regex
    package_name = re.sub(r'[<>=~!;].*$', '', package_name)
    # Remove any remaining whitespace and convert underscores to hyphens
    return package_name.strip().replace('_', '-')

@lru_cache(maxsize=1024)
def extract_base_package_name(dependency_spec: str) -> str:
    """
    Extract the base package name from a complex dependency specification.
    Handles cases like:
    - 'package (>=1.2.1,<2.0.0)'
    - 'package[extra] (>=1.2.1)'
    - 'package ; extra == "vlm"'
    - 'package (>=1.2.1) ; sys_platform == "darwin"'
    """
    # First, remove any conditions after semicolon
    base_spec = dependency_spec.split(';')[0].strip()
    
    # Extract the package name before any version specifiers or extras
    match = re.match(r'^([a-zA-Z0-9_.-]+)(?:\[[^\]]+\])?(?:\s*\([^)]*\))?$', base_spec)
    
    return clean_package_name(match.group(1) if match else base_spec)

@lru_cache(maxsize=1024)
def is_package_installed(package_name: str) -> bool:
    """Check if a package is installed in the current environment."""
    try:
        # Try both hyphenated and non-hyphenated versions
        try:
            importlib.metadata.distribution(package_name)
            return True
        except importlib.metadata.PackageNotFoundError:
            # Try with hyphens replaced by underscores
            alt_name = package_name.replace('-', '_')
            if alt_name != package_name:
                importlib.metadata.distribution(alt_name)
                return True
            return False
    except importlib.metadata.PackageNotFoundError:
        return False

@lru_cache(maxsize=1024)
def is_builtin_module(module_name: str) -> bool:
    """Check if a module is a Python built-in module."""
    if module_name in _builtin_modules_cache:
        return True
    
    # First check if it's a known built-in module name
    builtin_modules = {
        'os', 'sys', 'json', 'math', 'random', 'datetime', 'time', 'urllib', 'http', 
        'pathlib', 're', 'collections', 'itertools', 'functools', 'operator', 'typing',
        'io', 'csv', 'xml', 'html', 'email', 'base64', 'hashlib', 'hmac', 'uuid',
        'pickle', 'sqlite3', 'logging', 'unittest', 'argparse', 'configparser',
        'tempfile', 'shutil', 'glob', 'fnmatch', 'subprocess', 'threading', 'queue',
        'multiprocessing', 'concurrent', 'asyncio', 'socket', 'ssl', 'gzip', 'zipfile',
        'tarfile', 'zlib', 'bz2', 'lzma', 'struct', 'array', 'ctypes', 'mmap',
        'weakref', 'gc', 'inspect', 'dis', 'ast', 'token', 'tokenize', 'keyword',
        'builtins', '__main__', 'site', 'sysconfig', 'platform', 'warnings'
    }
    
    if module_name in builtin_modules:
        _builtin_modules_cache.add(module_name)
        return True
        
    try:
        module = importlib.import_module(module_name)
        
        # Built-in modules either have no __file__ attribute or their file is in the standard library
        if not hasattr(module, '__file__'):
            _builtin_modules_cache.add(module_name)
            return True
            
        # Get the standard library path
        stdlib_path = os.path.dirname(os.__file__)
        
        # Check if the module's file is in the standard library
        is_builtin = module.__file__ and module.__file__.startswith(stdlib_path)
        if is_builtin:
            _builtin_modules_cache.add(module_name)
        return is_builtin
    except ImportError:
        # If we can't import it, assume it's not a built-in module
        # This handles local modules that aren't in the current Python path
        return False

def get_direct_imports(file_path: str) -> Set[str]:
    """Extract direct imports from a Python file using AST parsing."""
    direct_imports = set()
    
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    base_pkg = name.name.split('.')[0]
                    if is_valid_package_name(base_pkg) and not is_builtin_module(base_pkg):
                        direct_imports.add(base_pkg)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    base_pkg = node.module.split('.')[0]
                    if is_valid_package_name(base_pkg) and not is_builtin_module(base_pkg):
                        direct_imports.add(base_pkg)
    except Exception as e:
        print(f"Warning: Could not parse imports from {file_path}: {str(e)}")
    
    return direct_imports

def get_all_python_files(project_root: str) -> List[str]:
    """Get all Python files in the project."""
    python_files = []
    for root, dirs, files in os.walk(project_root):
        # Skip common directories
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in 
                  {'__pycache__', 'node_modules', 'dist', 'build', 'venv'}]
        
        for file in files:
            if file.endswith('.py') and not file.startswith('.'):
                full_path = os.path.join(root, file)
                relative_path = os.path.relpath(full_path, project_root)
                python_files.append(relative_path)
    
    return python_files

def get_imports_from_file(file_path: str) -> Set[str]:
    """Get all import module names from a Python file."""
    imports = set()
    
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    imports.add(name.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.add(node.module)
    except Exception as e:
        print(f"Warning: Could not parse imports from {file_path}: {str(e)}")
    
    return imports

def get_local_files_for_entry(entry_file: str) -> List[str]:
    """Get local Python files that are imported by the entry file."""
    # Find project root
    project_root = os.path.dirname(entry_file)
    while project_root != os.path.dirname(project_root):
        if any(os.path.exists(os.path.join(project_root, f)) 
               for f in ['package.json', 'requirements.txt']):
            break
        project_root = os.path.dirname(project_root)
    
    # Get all Python files in the project
    all_python_files = get_all_python_files(project_root)
    
    # Get imports from the entry file
    imports = get_imports_from_file(entry_file)
    
    # Check which imports match local Python files
    local_files = []
    for import_name in imports:
        for py_file in all_python_files:
            # Convert file path to module name (e.g., 'utils/example.py' -> 'utils.example')
            module_name = py_file.replace(os.sep, '.').replace('.py', '')
            if import_name == module_name:
                local_files.append(py_file)
    
    return sorted(local_files)

def trace_imports(entry_file: str) -> List[str]:
    """Find all imported Python packages from entry file and its local imports."""
    entry_file = os.path.abspath(entry_file)
    
    # Get local files that are imported
    local_files = get_local_files_for_entry(entry_file)
    
    # Get project root
    project_root = os.path.dirname(entry_file)
    while project_root != os.path.dirname(project_root):
        if any(os.path.exists(os.path.join(project_root, f)) 
               for f in ['package.json', 'requirements.txt']):
            break
        project_root = os.path.dirname(project_root)
    
    # Get imports from entry file and local files
    all_packages = set()
    processed_packages = set()
    files_to_process = [entry_file] + [os.path.join(project_root, f) for f in local_files]
    
    for python_file in files_to_process:
        if os.path.exists(python_file):
            direct_imports = get_direct_imports(python_file)
            for package_name in direct_imports:
                if is_valid_package_name(package_name) and not is_builtin_module(package_name):
                    all_packages.add(package_name)
                    # Get all dependencies including sub-dependencies
                    all_packages.update(get_package_dependencies(package_name, processed_packages))
    
    return sorted(list(all_packages))

@lru_cache(maxsize=1024)
def is_optional_dependency(req: str) -> bool:
    """Check if a dependency is an optional dependency."""
    return '[' in req or 'extra ==' in req

def get_package_dependencies(package_name: str, processed: Set[str] = None) -> Set[str]:
    """Get all dependencies (including sub-dependencies) for a given package."""
    if processed is None:
        processed = set()
    
    if package_name in processed or is_builtin_module(package_name):
        return set()
    
    processed.add(package_name)
    all_dependencies = set()
    
    try:
        # Try to get the distribution
        try:
            dist = importlib.metadata.distribution(package_name)
        except importlib.metadata.PackageNotFoundError:
            print(f'Warning: Package {package_name} not found')
            return all_dependencies

        # Filter out optional dependencies
        sub_dependencies = list(filter(lambda dep: not is_optional_dependency(dep), dist.requires or []))
        
        # Get direct dependencies
        for req in sub_dependencies:                
            base_pkg = extract_base_package_name(req)
            
            if base_pkg and base_pkg not in processed:
                # Try both hyphenated and non-hyphenated versions
                for dep_name in [base_pkg, base_pkg.replace('-', '_'), base_pkg.replace('_', '-')]:
                    try:
                        importlib.import_module(dep_name)
                        all_dependencies.add(dep_name)
                        # Recursively get sub-dependencies
                        all_dependencies.update(get_package_dependencies(dep_name, processed))
                        break
                    except ImportError:
                        continue
            
    except Exception as e:
        print(f"Warning: Error processing {package_name}: {str(e)}")
    
    return all_dependencies

def main() -> None:
    """Main entry point for the script."""
    if len(sys.argv) != 2:
        print("Usage: python python-builder.py <entry_file>", file=sys.stderr)
        sys.exit(1)

    entry_file = sys.argv[1]
    try:
        packages = trace_imports(entry_file)
        local_files = get_local_files_for_entry(entry_file)
        

        
        output = {
            'packages': packages,
            'local_files': local_files
        }
        bytes_message = (json.dumps(output) + '\n').encode('utf-8')
        os.write(NODEIPCFD, bytes_message)
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(3)

if __name__ == "__main__":
    main()
