"""
Python Builder - Analyzes Python files to determine dependencies and package requirements.

This module scans Python files to extract imports, determine which files are part
of the project, and identify external package dependencies.
"""

import os
import sys
import json
import importlib.util
import traceback
import ast
import importlib.metadata
import re
from typing import Set, List, Tuple, Dict, Optional, Any, Callable
from functools import lru_cache

NODEIPCFD = int(os.environ.get("NODE_CHANNEL_FD", 0))

# Cache for built-in modules to avoid repeated checks
_builtin_modules_cache: Set[str] = set()

# Add a file content cache to avoid repeated file reads
_file_content_cache = {}

# ----------------------------------------
# Type Definitions
# ----------------------------------------

ModuleSet = Set[str]
ModuleName = str
PackageName = str 
RelativePath = str
FilePath = str
ModuleImports = Set[Tuple[str, str]]

# ----------------------------------------
# Core Utilities
# ----------------------------------------

@lru_cache(maxsize=1024)
def is_valid_package_name(name: str) -> bool:
    """
    Check if a name is a valid package name.
    
    Args:
        name: The package name to check
        
    Returns:
        True if the name is valid, False otherwise
    """
    if not name or name.startswith('_'):
        return False
    
    # Skip special modules
    invalid_names = {'__main__', 'module', 'cython_runtime', 'builtins'}
    return name not in invalid_names

@lru_cache(maxsize=1024)
def get_package_name(module_name: str) -> str:
    """
    Get the top-level package name from a module name.
    
    Args:
        module_name: A module name like 'pkg.subpkg.module'
        
    Returns:
        The top-level package name (e.g., 'pkg')
    """
    return module_name.split('.')[0]

@lru_cache(maxsize=1024)
def clean_package_name(package_name: str) -> str:
    """
    Clean package name by removing version specifiers and other metadata.
    
    Args:
        package_name: A possibly dirty package name with version specifiers
        
    Returns:
        A clean package name
    """
    # Remove version specifiers and conditions
    package_name = re.sub(r'[<>=~!;].*$', '', package_name)
    # Convert underscores to hyphens for consistency
    return package_name.strip().replace('_', '-')

@lru_cache(maxsize=1024)
def extract_base_package_name(dependency_spec: str) -> str:
    """
    Extract the base package name from a complex dependency specification.
    
    Handles cases like:
    - 'package (>=1.2.1,<2.0.0)'
    - 'package[extra] (>=1.2.1)'
    - 'package ; extra == "vlm"'
    
    Args:
        dependency_spec: A package dependency specification
        
    Returns:
        The base package name
    """
    # Remove any conditions after semicolon
    base_spec = dependency_spec.split(';')[0].strip()
    
    # Extract the package name before any version specifiers or extras
    match = re.match(r'^([a-zA-Z0-9_.-]+)(?:\[[^\]]+\])?(?:\s*\([^)]*\))?$', base_spec)
    return clean_package_name(match.group(1) if match else base_spec)

@lru_cache(maxsize=1024)
def is_optional_dependency(req: str) -> bool:
    """
    Check if a dependency is optional.
    
    Args:
        req: A dependency specification
        
    Returns:
        True if the dependency is optional, False otherwise
    """
    return '[' in req or 'extra ==' in req

# ----------------------------------------
# Package Management
# ----------------------------------------

@lru_cache(maxsize=1024)
def is_package_installed(package_name: str) -> bool:
    """
    Check if a package is installed in the current environment.
    
    Args:
        package_name: The package name to check
        
    Returns:
        True if the package is installed, False otherwise
    """
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
def get_package_version(package_name: str) -> str:
    """
    Get the installed version of a package.
    
    Args:
        package_name: The package name to check
        
    Returns:
        The package version or "unknown" if not found
    """
    try:
        return importlib.metadata.version(package_name)
    except importlib.metadata.PackageNotFoundError:
        pass  # Continue to try alternate names

    # Try with underscores instead of hyphens
    alt_name_underscore = package_name.replace('-', '_')
    if alt_name_underscore != package_name:
        try:
            return importlib.metadata.version(alt_name_underscore)
        except importlib.metadata.PackageNotFoundError:
            pass # Continue to try other alternate names
            
    # Try with hyphens instead of underscores
    alt_name_hyphen = package_name.replace('_', '-')
    if alt_name_hyphen != package_name:
        try:
            return importlib.metadata.version(alt_name_hyphen)
        except importlib.metadata.PackageNotFoundError:
            pass
            
    return "unknown"

@lru_cache(maxsize=1024)
def is_builtin_module(module_name: str) -> bool:
    """
    Check if a module is a Python built-in module.
    
    Args:
        module_name: The module name to check
        
    Returns:
        True if the module is built-in, False otherwise
    """
    if module_name in _builtin_modules_cache:
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
        return False

@lru_cache(maxsize=1024)
def read_file_cached(file_path: str) -> str:
    """
    Read a file and cache its content.
    
    Args:
        file_path: Path to the file to read
        
    Returns:
        The file content as a string
    """
    if file_path not in _file_content_cache:
        try:
            with open(file_path, 'r') as f:
                _file_content_cache[file_path] = f.read()
        except Exception as e:
            _file_content_cache[file_path] = ""
            print(f"Warning: Could not read file {file_path}: {str(e)}")
    
    return _file_content_cache[file_path]

@lru_cache(maxsize=1024)
def get_direct_imports(file_path: str) -> Set[str]:
    """Extract direct imports from a Python file using AST."""
    direct_imports = set()
    
    try:
        # Read the file content
        content = read_file_cached(file_path)
        if not content:
            return direct_imports
            
        # Parse the file using ast
        tree = ast.parse(content, filename=file_path)
        
        # Visit all import nodes
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    # Get the base module name
                    base_module = name.name.split('.')[0]
                    if is_valid_package_name(base_module) and not is_builtin_module(base_module):
                        direct_imports.add(base_module)
                        
            elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
                # Get the base module name for absolute imports only
                base_module = node.module.split('.')[0]
                if is_valid_package_name(base_module) and not is_builtin_module(base_module):
                    direct_imports.add(base_module)
    except Exception as e:
        print(f"Warning: Could not analyze imports from {file_path}: {str(e)}")
    
    return direct_imports

# Add dependency cache to avoid redundant dependency lookups
_package_dependencies_cache = {}

def get_package_dependencies(package_name: str, processed: Optional[Set[str]] = None) -> Set[str]:
    """
    Get all dependencies (including sub-dependencies) for a given package.
    
    Args:
        package_name: The package name to analyze
        processed: Set of already processed packages (for recursion)
        
    Returns:
        A set of package dependencies
    """
    if processed is None:
        processed = set()
        
    if package_name in processed or is_builtin_module(package_name):
        return set()
    
    # Check in cache first
    if package_name in _package_dependencies_cache:
        return _package_dependencies_cache[package_name]
    
    processed.add(package_name)
    dependencies = set()
    
    try:
        dist = None
        try:
            dist = importlib.metadata.distribution(package_name)
        except importlib.metadata.PackageNotFoundError:
            print(f"Warning: Package {package_name} not found")
        
        if not dist:
            _package_dependencies_cache[package_name] = set()
            return dependencies

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
                        dependencies.add(base_pkg)
                        # Recursively get sub-dependencies
                        dependencies.update(get_package_dependencies(dep_name, processed))
                        break
                    except ImportError:
                        continue
            
    except Exception as e:
        print(f"Warning: Error processing {package_name}: {str(e)}")
    
    # Cache result
    _package_dependencies_cache[package_name] = dependencies
    return dependencies

@lru_cache(maxsize=1024)
def is_external_package(package_name: str, project_dir: str) -> bool:
    """Determine if a package is external (not local to the project)."""
    # First, check if it's an installed package
    if is_package_installed(package_name):
        return True
        
    # Then check if it's a built-in module
    if is_builtin_module(package_name):
        return False
        
    # Check if it's a directory in the project
    package_dir = os.path.join(project_dir, package_name)
    if os.path.isdir(package_dir):
        return False
        
    # Try to find the module specification
    try:
        spec = importlib.util.find_spec(package_name)
        if spec and spec.origin:
            # If origin path is outside the project directory, it's external
            return not os.path.abspath(spec.origin).startswith(project_dir)
    except (ImportError, AttributeError, ModuleNotFoundError):
        pass
        
    # If we can't determine, assume external for safety
    return True

def process_init_file(init_file: str, module_dir: str, project_dir: str) -> Set[str]:
    """
    Process an __init__.py file to find relative imports.
    
    Args:
        init_file: Path to the __init__.py file
        module_dir: Path to the module directory
        project_dir: Path to the project root directory
        
    Returns:
        Set of relative paths to found module files
    """
    found_files = set()
    
    try:
        # Add the __init__.py file itself
        rel_init_path = os.path.relpath(init_file, project_dir)
        found_files.add(rel_init_path)
        
        # Extract imports using our AST-based function
        _, relative_imports, local_imports = extract_imports_from_file(init_file)
        
        # Process local imports (relative to the module directory)
        for module_name in local_imports:
            module_file = os.path.join(module_dir, f"{module_name}.py")
            if os.path.isfile(module_file):
                rel_module_path = os.path.relpath(module_file, project_dir)
                found_files.add(rel_module_path)
                
        # Process relative imports
        for main_module, sub_module in relative_imports:
            # If this is an import from the current package
            if main_module == os.path.basename(module_dir):
                sub_module_file = os.path.join(module_dir, f"{sub_module}.py")
                if os.path.isfile(sub_module_file):
                    rel_module_path = os.path.relpath(sub_module_file, project_dir)
                    found_files.add(rel_module_path)
                    
    except Exception as e:
        print(f"Warning: Error parsing {init_file}: {str(e)}")
    
    return found_files

def process_local_module(import_name: str, project_dir: str) -> Set[str]:
    """
    Process a local module directory to find Python files.
    
    Args:
        import_name: The name of the import
        project_dir: Path to the project root directory
        
    Returns:
        Set of relative paths to found module files
    """
    found_files = set()
    module_dir = os.path.join(project_dir, import_name)
    
    # Skip if not a directory
    if not os.path.isdir(module_dir):
        return found_files
        
    # Look for __init__.py in module directory
    init_file = os.path.join(module_dir, '__init__.py')
    if os.path.isfile(init_file):
        rel_path = os.path.relpath(init_file, project_dir)
        found_files.add(rel_path)
        
        # Process the __init__.py file for relative imports
        found_files.update(process_init_file(init_file, module_dir, project_dir))
    
    # Also scan the module directory for .py files
    for file in os.listdir(module_dir):
        if file.endswith('.py'):
            module_file = os.path.join(module_dir, file)
            rel_path = os.path.relpath(module_file, project_dir)
            found_files.add(rel_path)
            
    return found_files

# Helper function for find_project_files
def _add_package_files_for_find_project_files(package_dir: str, project_dir: str, processed_packages: Set[str], project_files: Set[str], processed_files: Set[str], process_file_func: Callable):
    """Add all Python files from a package directory."""
    if not os.path.isdir(package_dir):
        return
            
    if package_dir in processed_packages:
        return
            
    processed_packages.add(package_dir)
        
    all_files = os.listdir(package_dir)
        
    for file_name in all_files:
        file_path = os.path.join(package_dir, file_name)
            
        if file_name.endswith('.py'):
            rel_path = os.path.relpath(file_path, project_dir)
            project_files.add(rel_path)
                
            if file_path not in processed_files:
                process_file_func(file_path, project_dir, processed_files, project_files, set(), _add_package_files_for_find_project_files, extract_imports_from_file, is_builtin_module) # found_modules is locally scoped in original process_file
                
        elif os.path.isdir(file_path) and os.path.exists(os.path.join(file_path, '__init__.py')):
            _add_package_files_for_find_project_files(file_path, project_dir, processed_packages, project_files, processed_files, process_file_func)

# Helper function for find_project_files
def _process_file_for_find_project_files(file_path: str, project_dir: str, processed_files: Set[str], project_files: Set[str], found_modules: Set[str], add_package_files_func: Callable, extract_imports_func: Callable, is_builtin_func: Callable):
    """Process a file to extract imports and related project files."""
    if file_path in processed_files:
        return
            
    processed_files.add(file_path)
        
    try:
        rel_path = os.path.relpath(file_path, project_dir)
        project_files.add(rel_path)
            
        direct_imports, rel_imports, local_imports = extract_imports_func(file_path)
            
        file_dir = os.path.dirname(file_path)
            
        if os.path.basename(file_path) == "__init__.py":
            # Re-initialize processed_packages for this specific call context if necessary, or pass it if it's meant to be shared globally within find_project_files
            # For now, assuming it's fresh for each __init__ processing or managed by the caller.
            # If it's shared, it should be passed from find_project_files through _add_package_files_for_find_project_files
            # For simplicity here, creating a new set. This might need adjustment based on exact desired shared state.
            current_processed_packages = set() # This might need to be passed from find_project_files
            add_package_files_func(file_dir, project_dir, current_processed_packages, project_files, processed_files, _process_file_for_find_project_files)
            
        for module_name in local_imports:
            local_path = os.path.join(file_dir, f"{module_name}.py")
            if os.path.isfile(local_path) and module_name not in found_modules:
                found_modules.add(module_name)
                _process_file_for_find_project_files(local_path, project_dir, processed_files, project_files, found_modules, add_package_files_func, extract_imports_func, is_builtin_func)
            
        for import_name in direct_imports:
            if is_builtin_func(import_name):
                continue
                
            module_dir = os.path.join(project_dir, import_name)
            if os.path.isdir(module_dir):
                init_file = os.path.join(module_dir, '__init__.py')
                if os.path.isfile(init_file):
                    _process_file_for_find_project_files(init_file, project_dir, processed_files, project_files, found_modules, add_package_files_func, extract_imports_func, is_builtin_func)
                
        for main_module, sub_module in rel_imports:
            module_dir = os.path.join(project_dir, main_module)
            if os.path.isdir(module_dir):
                sub_file = os.path.join(module_dir, f"{sub_module}.py")
                if os.path.isfile(sub_file) and sub_module not in found_modules:
                    found_modules.add(sub_module)
                    _process_file_for_find_project_files(sub_file, project_dir, processed_files, project_files, found_modules, add_package_files_func, extract_imports_func, is_builtin_func)
                        
    except Exception as e:
        print(f"WARNING: Error analyzing imports in {file_path}: {str(e)}")

def find_project_files(entry_file: str) -> List[str]:
    """Find all project Python files used by the entry file."""
    entry_file = os.path.abspath(entry_file)
    entry_dir = os.path.dirname(entry_file)
    
    project_dir = entry_dir
    current_dir = entry_dir
    
    max_depth = 3
    depth = 0
    
    while depth < max_depth and os.path.dirname(current_dir) != current_dir:
        if any(os.path.exists(os.path.join(current_dir, f)) for f in 
               ['setup.py', 'pyproject.toml', 'requirements.txt', 'Pipfile']):
            project_dir = current_dir
            break
            
        if os.path.exists(os.path.join(current_dir, '__init__.py')):
            project_dir = os.path.dirname(current_dir)
            break
            
        parent_dir = os.path.dirname(current_dir)
        if parent_dir == current_dir:
            break
            
        current_dir = parent_dir
        depth += 1
    
    project_files: Set[str] = set()
    processed_files: Set[str] = set()
    found_modules: Set[str] = set() 
    processed_packages: Set[str] = set() 
    
    entry_rel_path = os.path.relpath(entry_file, project_dir)
    project_files.add(entry_rel_path)
    
    # Initial call to process the entry file
    _process_file_for_find_project_files(entry_file, project_dir, processed_files, project_files, found_modules, _add_package_files_for_find_project_files, extract_imports_from_file, is_builtin_module)
    
    return sorted(list(project_files))

@lru_cache(maxsize=1024)
def analyze_imports(file_path, project_dir):
    """Analyze imports from a Python file and return a set of imported modules using AST."""
    imported_modules = set()
    
    try:
        # Read the file content
        content = read_file_cached(file_path)
        if not content:
            return imported_modules
            
        # Parse the file using ast
        try:
            tree = ast.parse(content, filename=file_path)
        except SyntaxError:
            # If we can't parse the file, fall back to the empty results
            return imported_modules
            
        # Visit all import nodes
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    # Add the full module name
                    full_name = name.name
                    imported_modules.add(full_name)
                    
                    # Add parent packages
                    parts = full_name.split('.')
                    for i in range(1, len(parts)):
                        parent = '.'.join(parts[:i])
                        imported_modules.add(parent)
                        
            elif isinstance(node, ast.ImportFrom):
                if node.level == 0 and node.module:  # Only absolute imports
                    # Add the module being imported from
                    imported_modules.add(node.module)
                    
                    # Add parent packages
                    parts = node.module.split('.')
                    for i in range(1, len(parts)):
                        parent = '.'.join(parts[:i])
                        imported_modules.add(parent)
                        
                    # Add imported names with their full module path
                    for alias in node.names:
                        full_import = f"{node.module}.{alias.name}"
                        imported_modules.add(full_import)
                        
    except Exception as e:
        print(f"Warning: Error analyzing imports in {file_path}: {str(e)}")
        
    return imported_modules

def process_module_import(imp: str, module_submodules: Dict[str, Set[str]]) -> Tuple[str, Optional[str]]:
    """
    Process an import string to extract module and submodule.
    
    Args:
        imp: The import string
        module_submodules: Dictionary to update with module/submodule info
        
    Returns:
        Tuple of (module_name, submodule_name or None)
    """
    if '.' not in imp:
        return imp, None
        
    parts = imp.split('.')
    module = parts[0]
    submodule = parts[1] if len(parts) > 1 else None
    
    # Update module_submodules dictionary
    if module not in module_submodules:
        module_submodules[module] = set()
    
    if submodule:
        module_submodules[module].add(submodule)
        
    return module, submodule

# Helper function for find_transitive_imports
def _visit_file_for_transitive_imports(file_path: str, project_dir: str, current_depth: int, all_imports: Set[str], visited_files: Set[str], module_submodules: Dict[str, Set[str]], analyze_imports_func: Callable, visit_file_func: Callable):
    """Visit a file and recursively process its imports up to the specified depth."""
    if current_depth <= 0 or file_path in visited_files:
        return
            
    visited_files.add(file_path)
        
    file_imports = analyze_imports_func(file_path, project_dir)
    all_imports.update(file_imports)
        
    if current_depth > 1:
        for imp in file_imports:
            module = imp.split('.')[0]
                
            if '.' in imp:
                if module not in module_submodules:
                    module_submodules[module] = set()
                submodule = imp.split('.')[1]
                module_submodules[module].add(submodule)
                
            module_dir = os.path.join(project_dir, module)
            init_path = os.path.join(module_dir, '__init__.py')
            if os.path.isdir(module_dir) and os.path.isfile(init_path) and init_path not in visited_files:
                visit_file_func(init_path, project_dir, current_depth - 1, all_imports, visited_files, module_submodules, analyze_imports_func, visit_file_func)
                
            if '.' in imp:
                parts = imp.split('.')
                # Ensure parts has at least two elements before trying to access parts[-1] and parts[:-1]
                if len(parts) > 1:
                    potential_path = os.path.join(project_dir, *parts[:-1], f"{parts[-1]}.py")
                    if os.path.isfile(potential_path) and potential_path not in visited_files:
                        visit_file_func(potential_path, project_dir, current_depth - 1, all_imports, visited_files, module_submodules, analyze_imports_func, visit_file_func)

def find_transitive_imports(initial_file, project_dir, depth=2):
    """Find all transitive imports up to a certain depth using AST-based analysis."""
    all_imports: Set[str] = set()
    visited_files: Set[str] = set()
    module_submodules: Dict[str, Set[str]] = {}  # Track modules and their submodules
    
    # Start the recursive process
    _visit_file_for_transitive_imports(initial_file, project_dir, depth, all_imports, visited_files, module_submodules, analyze_imports, _visit_file_for_transitive_imports)
    return all_imports, module_submodules

def collect_local_modules(imported_modules: Set[str], project_dir: str) -> Set[str]:
    """
    Identify which imported modules are local to the project.
    
    Args:
        imported_modules: Set of all imported modules
        project_dir: Project directory root
        
    Returns:
        Set of module names that are local to the project
    """
    local_modules = set()
    
    for name in imported_modules:
        if '.' not in name:
            continue
            
        # Get the base module name
        base_module = name.split('.')[0]
        
        # Check if it's a local module
        module_dir = os.path.join(project_dir, base_module)
        if os.path.isdir(module_dir):
            local_modules.add(name)
            
    return local_modules

def collect_project_files(finder_modules: Dict[str, Any], project_dir: str) -> List[str]:
    """
    Collect project files from ModuleFinder results.
    
    Args:
        finder_modules: Dictionary of modules from ModuleFinder
        project_dir: Project directory root
        
    Returns:
        List of relative paths to project files
    """
    project_files = []
    
    for name, mod in finder_modules.items():
        try:
            # Skip modules without a file or None modules
            if mod is None or not hasattr(mod, '__file__') or mod.__file__ is None:
                continue
                
            # Get the absolute path of the module
            module_path = os.path.abspath(mod.__file__)
            
            # Only include files within the project directory
            if not (module_path.startswith(project_dir) and os.path.isfile(module_path)):
                continue
                
            rel_path = os.path.relpath(module_path, project_dir)
            
            # Skip __pycache__ and other non-source files
            if any(pattern in rel_path for pattern in ['__pycache__', '.pyc']):
                continue
                
            project_files.append(rel_path)
        except Exception as e:
            print(f"Warning: Error processing module {name}: {str(e)}")
            
    return project_files

def collect_external_packages(imported_modules: Set[str], local_modules: Set[str]) -> Set[str]:
    """
    Identify external packages from the imported modules.
    
    Args:
        imported_modules: Set of all imported modules
        local_modules: Set of local modules to exclude
        
    Returns:
        Set of external package names
    """
    external_packages = set()
    
    for name in imported_modules:
        # Skip local modules
        if name in local_modules:
            continue
            
        # Skip modules that are part of local modules
        is_part_of_local = any(name.startswith(local_mod + '.') for local_mod in local_modules)
        if is_part_of_local:
            continue
            
        # Only include non-builtin modules
        if not is_builtin_module(name):
            # Get the top-level package name
            package_name = get_package_name(name)
            if is_valid_package_name(package_name):
                external_packages.add(package_name)
                
    return external_packages

def process_single_file(file_path, project_dir, processed_files, project_files):
    """
    Process a single file to extract imports and add to project files.
    
    Args:
        file_path: Path to the file to process
        project_dir: Project directory path
        processed_files: Set of already processed files
        project_files: List of project files to update
        
    Returns:
        Tuple of (direct_imports, relative_imports, local_imports)
    """
    if file_path in processed_files:
        return None
        
    processed_files.add(file_path)
    rel_path = os.path.relpath(file_path, project_dir)
    if rel_path not in project_files:
        project_files.append(rel_path)
        
    # Extract imports from this file using AST
    return extract_imports_from_file(file_path)

def process_local_relative_imports(file_path, local_imports, project_dir, processed_files, project_files):
    """
    Process local relative imports from a file.
    
    Args:
        file_path: Path to the file containing imports
        local_imports: Set of local import names
        project_dir: Project directory path
        processed_files: Set of already processed files
        project_files: List of project files to update
    """
    file_dir = os.path.dirname(file_path)
    for module_name in local_imports:
        local_path = os.path.join(file_dir, f"{module_name}.py")
        if os.path.isfile(local_path) and local_path not in processed_files:
            process_single_file(local_path, project_dir, processed_files, project_files)

def process_module_relative_imports(main_module, sub_module, project_dir, processed_files, project_files):
    """
    Process relative imports for a module.
    
    Args:
        main_module: Main module name
        sub_module: Submodule name
        project_dir: Project directory path
        processed_files: Set of already processed files
        project_files: List of project files to update
    """
    # Look for the module in the project
    module_dir = os.path.join(project_dir, main_module)
    if not os.path.isdir(module_dir):
        return
        
    # Check for __init__.py
    init_file = os.path.join(module_dir, "__init__.py")
    if os.path.isfile(init_file) and init_file not in processed_files:
        process_single_file(init_file, project_dir, processed_files, project_files)
    
    # Check for the submodule
    sub_module_file = os.path.join(module_dir, f"{sub_module}.py")
    if os.path.isfile(sub_module_file) and sub_module_file not in processed_files:
        process_single_file(sub_module_file, project_dir, processed_files, project_files)

def collect_external_package_info(pkg_name, package_names):
    """
    Collect information about an external package and its dependencies.
    
    Args:
        pkg_name: Package name to process
        package_names: Set of already processed package names
        
    Returns:
        List of dictionaries with package name and version
    """
    if pkg_name in package_names:
        return []
        
    result = []
    package_names.add(pkg_name)
    version = get_package_version(pkg_name)
    result.append({"name": pkg_name, "version": version})
    
    # Get dependencies for this package
    for sub_dep in get_package_dependencies(pkg_name):
        if not is_builtin_module(sub_dep) and sub_dep not in package_names:
            package_names.add(sub_dep)
            sub_version = get_package_version(sub_dep)
            result.append({"name": sub_dep, "version": sub_version})
            
    return result

def find_project_dependencies(entry_file, project_dir):
    """
    Find all project dependencies starting from an entry file.
    
    Args:
        entry_file (str): Path to the entry Python file
        project_dir (str): Path to the project directory
        
    Returns:
        tuple: (external_packages, project_files) where:
            - external_packages is a list of dictionaries with 'name' and 'version' fields
            - project_files is a list of relative paths to project files
    """
    # Pre-populate the content cache for the entry file
    read_file_cached(entry_file)
    
    # Track imported modules and their submodules using AST-based extraction
    direct_imports_set, _, _ = extract_imports_from_file(entry_file) 
    processed_files = set()
    project_files = []
    package_names = set()  # Track package names to avoid duplicates
    
    # Variables needed by nested functions
    processed_packages_for_imports: Set[str] = set()
    found_modules_for_processing: Set[str] = set()
    
    original_entry_file_abs_path = os.path.abspath(entry_file) # Store the absolute path of the original entry file

    # Define the process_file function to be passed around, correctly binding its external dependencies.
    def _process_file_base(file_path_to_process: str):
        _process_file_for_dependencies(
            file_path_to_process, 
            project_dir, 
            processed_files, 
            project_files, 
            found_modules_for_processing, 
            extract_imports_from_file, 
            is_builtin_module, 
            lambda pkg_dir, init_f: _process_package_imports_for_dependencies(pkg_dir, init_f, project_dir, processed_packages_for_imports, processed_files, _process_file_base),
            original_entry_file_abs_path # Pass the original entry file's absolute path
        )

    # Initial call to process the entry file and its dependencies
    # The entry file itself will not be added to project_files due to the check in _process_file_for_dependencies
    _process_file_base(entry_file)
    
    # Get external packages with versions (ignore local modules and built-ins)
    external_packages = []
    
    # Process direct imports
    for pkg_name in direct_imports_set:
        if not is_builtin_module(pkg_name) and not os.path.isdir(os.path.join(project_dir, pkg_name)):
            # Check if it's an installed package
            if is_package_installed(pkg_name):
                external_packages.extend(collect_external_package_info(pkg_name, package_names))
    
    # IMPORTANT CHANGE: Ensure we have unique files to avoid duplicates
    project_files = sorted(list(set(project_files)))
    
    external_packages.sort(key=lambda x: x["name"])
    
    return external_packages, project_files

# Helper function for find_project_dependencies
def _process_package_imports_for_dependencies(package_dir: str, init_file: str, project_dir:str, processed_packages: Set[str], processed_files: Set[str], process_file_func: Callable):
    """Process imports from an __init__.py file for dependency resolution."""
    if package_dir in processed_packages:
        return
            
    processed_packages.add(package_dir)
        
    try:
        if init_file not in processed_files:
            # This process_file_func is the one that will be defined as _process_file_for_dependencies
            # It needs its own set of parameters. We assume it can be called with init_file and it handles the rest (e.g. project_dir, etc.)
            # This implies _process_file_for_dependencies needs to be defined and passed correctly.
             process_file_func(init_file) # This call needs to be adapted if _process_file_for_dependencies needs more args from this scope
                
        with open(init_file, 'r') as f:
            content = f.read()
                
        for line in content.split('\n'):
            line = line.strip()
                
            if not line or line.startswith('#'):
                continue
                    
            match = re.match(r'from\s+\.([a-zA-Z0-9_]+)\s+import', line)
            if match:
                module_name = match.group(1)
                module_path = os.path.join(package_dir, f"{module_name}.py")
                    
                if os.path.isfile(module_path):
                    # Same assumption as above for process_file_func call
                    process_file_func(module_path)
        
    except Exception as e:
        print(f"WARNING: Error processing imports from {init_file}: {str(e)}")

# Helper function for find_project_dependencies
def _process_file_for_dependencies(file_path: str, project_dir: str, processed_files: Set[str], project_files_list: List[str], found_modules_set: Set[str], extract_imports_func: Callable, is_builtin_func: Callable, process_pkg_imports_func: Callable, original_entry_file_abs_path: str):
    """Process a file for dependency resolution, extracting imports and related project files."""
    current_file_abs_path = os.path.abspath(file_path)
    if current_file_abs_path in processed_files:
        return
            
    processed_files.add(current_file_abs_path)
        
    try:
        # Add to project_files_list ONLY if it's not the original entry file.
        if current_file_abs_path != original_entry_file_abs_path:
            rel_path = os.path.relpath(current_file_abs_path, project_dir)
            # Ensure project_files_list is treated as a list, not a set for append
            if rel_path not in project_files_list:
                 project_files_list.append(rel_path)
            
        direct_imports, rel_imports, local_imports = extract_imports_func(current_file_abs_path)
            
        file_dir = os.path.dirname(current_file_abs_path)
            
        if os.path.basename(current_file_abs_path) == "__init__.py":
            # The process_pkg_imports_func is the lambda defined in find_project_dependencies,
            # which captures necessary context (project_dir, shared processed_packages set, shared processed_files set, and _process_file_base for recursion).
            # It only expects package_dir (file_dir here) and init_file (current_file_abs_path here) as direct arguments.
            process_pkg_imports_func(file_dir, current_file_abs_path)
            
        for module_name in local_imports:
            local_path = os.path.join(file_dir, f"{module_name}.py")
            if os.path.isfile(local_path) and module_name not in found_modules_set:
                found_modules_set.add(module_name)
                _process_file_for_dependencies(local_path, project_dir, processed_files, project_files_list, found_modules_set, extract_imports_func, is_builtin_func, process_pkg_imports_func, original_entry_file_abs_path)
            
        for import_name in direct_imports:
            if is_builtin_func(import_name):
                continue
                
            module_dir = os.path.join(project_dir, import_name)
            if os.path.isdir(module_dir):
                init_file_path = os.path.join(module_dir, '__init__.py')
                if os.path.isfile(init_file_path):
                    _process_file_for_dependencies(init_file_path, project_dir, processed_files, project_files_list, found_modules_set, extract_imports_func, is_builtin_func, process_pkg_imports_func, original_entry_file_abs_path)
                
        for main_module, sub_module in rel_imports:
            module_dir_path = os.path.join(project_dir, main_module)
            if os.path.isdir(module_dir_path):
                sub_file_path = os.path.join(module_dir_path, f"{sub_module}.py")
                if os.path.isfile(sub_file_path) and sub_module not in found_modules_set:
                    found_modules_set.add(sub_module)
                    _process_file_for_dependencies(sub_file_path, project_dir, processed_files, project_files_list, found_modules_set, extract_imports_func, is_builtin_func, process_pkg_imports_func, original_entry_file_abs_path)
                        
    except Exception as e:
        print(f"WARNING: Error analyzing imports in {file_path}: {str(e)}")

@lru_cache(maxsize=1024)
def extract_imports_from_file(file_path):
    """
    Extract direct imports and module-specific imports from a Python file using AST.
    
    Args:
        file_path (str): Path to the Python file to analyze
        
    Returns:
        tuple: (direct_imports, relative_imports, local_relative_imports) where all are sets of module names
    """
    direct_imports = set()
    relative_imports = set()  # For relative imports within any package
    local_relative_imports = set()  # For relative imports in the same directory
    
    try:
        # Read the file content
        content = read_file_cached(file_path)
        if not content:
            return direct_imports, relative_imports, local_relative_imports
            
        # Parse the file using ast
        try:
            tree = ast.parse(content, filename=file_path)
        except SyntaxError:
            # If we can't parse the file, fall back to the empty results
            return direct_imports, relative_imports, local_relative_imports
            
        # Visit all nodes and extract imports
        for node in ast.walk(tree):
            # Handle regular imports: import x, import x.y
            if isinstance(node, ast.Import):
                di, ri = process_import_node(node)
                direct_imports.update(di)
                relative_imports.update(ri)
                
            # Handle from imports: from x import y, from .x import y
            elif isinstance(node, ast.ImportFrom):
                di, ri, lri = process_importfrom_node(node, file_path)
                direct_imports.update(di)
                relative_imports.update(ri)
                local_relative_imports.update(lri)
                
    except Exception as e:
        # Silently ignore file reading/parsing errors
        pass
    
    return direct_imports, relative_imports, local_relative_imports

def process_import_node(node: ast.Import) -> Tuple[Set[str], Set[Tuple[str, str]]]:
    """
    Process an Import node from AST.
    
    Args:
        node: AST Import node
        
    Returns:
        Tuple of (direct_imports, relative_imports)
    """
    direct_imports = set()
    relative_imports = set()
    
    for name in node.names:
        module_name = name.name.split('.')[0]
        direct_imports.add(module_name)
        
        # Track submodules
        if '.' in name.name:
            parts = name.name.split('.')
            # Store the full import path for relative module tracking
            if len(parts) > 1:
                relative_imports.add((parts[0], parts[1]))
                
    return direct_imports, relative_imports

def process_importfrom_node(node: ast.ImportFrom, file_path: str) -> Tuple[Set[str], Set[Tuple[str, str]], Set[str]]:
    """
    Process an ImportFrom node from AST.
    
    Args:
        node: AST ImportFrom node
        file_path: Path to the file being processed
        
    Returns:
        Tuple of (direct_imports, relative_imports, local_relative_imports)
    """
    direct_imports = set()
    relative_imports = set()
    local_relative_imports = set()
    
    # For absolute imports (level=0)
    if node.level == 0 and node.module:
        base_module = node.module.split('.')[0]
        direct_imports.add(base_module)
        
        # Track submodules
        if '.' in node.module:
            parts = node.module.split('.')
            if len(parts) > 1:
                relative_imports.add((parts[0], parts[1]))
        else:
            # Add module-specific imports
            for name in node.names:
                relative_imports.add((node.module, name.name))
    
    # Handle relative imports in the file's directory
    elif node.level > 0:
        # This is a relative import
        if not node.module:  # from . import x
            for name in node.names:
                if os.path.basename(file_path) == "__init__.py":
                    dir_name = os.path.basename(os.path.dirname(file_path))
                    relative_imports.add((dir_name, name.name))
                else:
                    local_relative_imports.add(name.name)
        else:  # from .x import y
            if os.path.basename(file_path) == "__init__.py":
                dir_name = os.path.basename(os.path.dirname(file_path))
                relative_imports.add((dir_name, node.module))
            else:
                local_relative_imports.add(node.module)
                
    return direct_imports, relative_imports, local_relative_imports

@lru_cache(maxsize=1024)
def is_local_module(module_name: str, project_dir: str) -> bool:
    """
    Check if a module is local to the project.
    
    Args:
        module_name: The module name to check
        project_dir: The project directory path
        
    Returns:
        True if the module is local, False otherwise
    """
    # Check if it's a directory in the project
    module_dir = os.path.join(project_dir, module_name)
    if os.path.isdir(module_dir):
        return True
    
    # Try to find the module using importlib
    try:
        spec = importlib.util.find_spec(module_name)
        if spec and spec.origin:
            return os.path.abspath(spec.origin).startswith(project_dir)
    except (ImportError, AttributeError, ModuleNotFoundError):
        pass
    
    return False

def main() -> None:
    """Main entry point for the script."""
    if len(sys.argv) != 2:
        print("Usage: python python-builder.py <entry_file>")
        sys.exit(1)

    entry_file = sys.argv[1]
    
    try:
        # Get absolute paths
        entry_file = os.path.abspath(entry_file)
        entry_dir = os.path.dirname(entry_file)
        project_dir = os.path.dirname(entry_dir)
        
        # Find project dependencies
        packages, project_files = find_project_dependencies(entry_file, project_dir)
        
        # Prepare output
        output = {
            'packages': packages,
            'files': project_files,
        }
        
        # Output as JSON
        bytes_message = (json.dumps(output) + '\n').encode('utf-8')
        if NODEIPCFD > 0:
            os.write(NODEIPCFD, bytes_message)
        else:
            print(bytes_message)
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(3)

if __name__ == "__main__":
    main()
