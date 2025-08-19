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

def get_local_python_files(entry_file: str, project_root: str, processed_files: Set[str] = None) -> Set[str]:
    """Recursively find all local Python files imported by the entry file."""
    if processed_files is None:
        processed_files = set()
    
    if entry_file in processed_files:
        return set()
    
    processed_files.add(entry_file)
    local_files = set()
    
    # Ensure project root is in Python path for import resolution
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    try:
        with open(entry_file, 'r') as f:
            content = f.read()
        
        tree = ast.parse(content)
        entry_dir = os.path.dirname(entry_file)
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    # Check if this could be a local file
                    potential_file = os.path.join(entry_dir, name.name.replace('.', os.sep) + '.py')
                    if os.path.exists(potential_file) and potential_file.startswith(project_root):
                        local_files.add(potential_file)
                        # Recursively process this local file
                        local_files.update(get_local_python_files(potential_file, project_root, processed_files))
            
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    if node.level > 0:  # Relative import
                        # Handle relative imports
                        current_dir = entry_dir
                        for _ in range(node.level - 1):
                            current_dir = os.path.dirname(current_dir)
                        
                        if node.module:
                            module_path = os.path.join(current_dir, node.module.replace('.', os.sep))
                        else:
                            module_path = current_dir
                        
                        # Check for both package (__init__.py) and module (.py)
                        potential_files = [
                            module_path + '.py',
                            os.path.join(module_path, '__init__.py')
                        ]
                        
                        for potential_file in potential_files:
                            if os.path.exists(potential_file) and potential_file.startswith(project_root):
                                local_files.add(potential_file)
                                local_files.update(get_local_python_files(potential_file, project_root, processed_files))
                                break
                    else:
                        # Absolute import - check if it's a local file
                        potential_paths = [
                            os.path.join(project_root, node.module.replace('.', os.sep) + '.py'),
                            os.path.join(project_root, node.module.replace('.', os.sep), '__init__.py'),
                            os.path.join(entry_dir, node.module.replace('.', os.sep) + '.py'),
                            os.path.join(entry_dir, node.module.replace('.', os.sep), '__init__.py')
                        ]
                        
                        for potential_file in potential_paths:
                            if os.path.exists(potential_file) and potential_file.startswith(project_root):
                                local_files.add(potential_file)
                                local_files.update(get_local_python_files(potential_file, project_root, processed_files))
                                break
                                
    except Exception as e:
        print(f"Warning: Could not parse local imports from {entry_file}: {str(e)}")
    
    return local_files

def trace_imports(entry_file: str) -> List[str]:
    """Find all imported Python packages and files starting from an entry file."""
    entry_file = os.path.abspath(entry_file)
    module_dir = os.path.dirname(entry_file)
    
    # Find project root - it should be the directory that contains both the step file and other project files
    # For steps in 'steps' directory, the project root is usually the parent of the 'steps' directory
    project_root = os.path.dirname(entry_file)
    
    # If the step is in a 'steps' directory, go up to the parent
    if os.path.basename(project_root) != 'steps':
        # Navigate up until we find the 'steps' directory or reach a reasonable stopping point
        while project_root != os.path.dirname(project_root):
            if os.path.basename(project_root) == 'steps':
                project_root = os.path.dirname(project_root)  # Go up one more level
                break
            project_root = os.path.dirname(project_root)
    else:
        # We're in the steps directory, go up one level
        project_root = os.path.dirname(project_root)
    
    # Verify this looks like a project root (has package.json or other project indicators)
    if not (os.path.exists(os.path.join(project_root, 'package.json')) or 
            os.path.exists(os.path.join(project_root, 'requirements.txt')) or
            os.path.exists(os.path.join(project_root, 'motia-workbench.json'))):
        # Fallback: use parent of steps directory relative to entry file
        entry_parts = entry_file.split(os.sep)
        if 'steps' in entry_parts:
            steps_index = entry_parts.index('steps')
            project_root = os.sep.join(entry_parts[:steps_index])
    
    # Final fallback
    if not project_root or project_root == os.path.dirname(project_root):
        project_root = os.path.dirname(os.path.dirname(entry_file))
    

    
    # Add both the module directory and project root to Python path early
    if module_dir not in sys.path:
        sys.path.insert(0, module_dir)
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    # Also add parent directories that might contain modules
    current_dir = os.path.dirname(entry_file)
    while current_dir != project_root and current_dir != os.path.dirname(current_dir):
        if current_dir not in sys.path:
            sys.path.insert(0, current_dir)
        current_dir = os.path.dirname(current_dir)
    
    # Get all local Python files that are imported
    local_files = get_local_python_files(entry_file, project_root)
    all_python_files = {entry_file} | local_files
    
    # Initialize sets to track packages
    all_packages = set()
    processed_packages = set()
    
    # Process imports from all Python files (entry + local imports)
    for python_file in all_python_files:
        direct_imports = get_direct_imports(python_file)
        
        # Process each direct import and its dependencies
        for package_name in direct_imports:
            if is_valid_package_name(package_name):
                all_packages.add(package_name)
                # Get all dependencies including sub-dependencies
                all_packages.update(get_package_dependencies(package_name, processed_packages))
    
    # Filter out built-in packages
    non_builtin_packages = {pkg for pkg in all_packages if not is_builtin_module(pkg)}
    
    return sorted(list(non_builtin_packages))

def get_local_files_for_entry(entry_file: str) -> List[str]:
    """Get list of local Python files imported by entry file."""
    entry_file = os.path.abspath(entry_file)
    
    # Use the same project root detection logic as trace_imports
    project_root = os.path.dirname(entry_file)
    
    # If the step is in a 'steps' directory, go up to the parent
    if os.path.basename(project_root) != 'steps':
        # Navigate up until we find the 'steps' directory or reach a reasonable stopping point
        while project_root != os.path.dirname(project_root):
            if os.path.basename(project_root) == 'steps':
                project_root = os.path.dirname(project_root)  # Go up one more level
                break
            project_root = os.path.dirname(project_root)
    else:
        # We're in the steps directory, go up one level
        project_root = os.path.dirname(project_root)
    
    # Verify this looks like a project root (has package.json or other project indicators)
    if not (os.path.exists(os.path.join(project_root, 'package.json')) or 
            os.path.exists(os.path.join(project_root, 'requirements.txt')) or
            os.path.exists(os.path.join(project_root, 'motia-workbench.json'))):
        # Fallback: use parent of steps directory relative to entry file
        entry_parts = entry_file.split(os.sep)
        if 'steps' in entry_parts:
            steps_index = entry_parts.index('steps')
            project_root = os.sep.join(entry_parts[:steps_index])
    
    # Final fallback
    if not project_root or project_root == os.path.dirname(project_root):
        project_root = os.path.dirname(os.path.dirname(entry_file))
    
    # Get all local Python files that are imported
    local_files = get_local_python_files(entry_file, project_root)
    
    # Convert to relative paths from project root
    relative_files = []
    for local_file in local_files:
        try:
            relative_path = os.path.relpath(local_file, project_root)
            relative_files.append(relative_path)
        except ValueError:
            # File is outside project root, skip it
            continue
    
    return sorted(relative_files)

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
