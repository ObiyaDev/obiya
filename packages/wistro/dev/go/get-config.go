// get-config.go
package main

import (
	"encoding/json"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strconv"
)

// Config matches the structure in the step file
type Config struct {
	Name       string        `json:"name"`
	Subscribes []string      `json:"subscribes"`
	Emits      []string      `json:"emits"`
	Input      interface{}   `json:"input"`
	Flows      []string      `json:"flows"`
}

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Usage: %s <file_path>\n", os.Args[0])
		os.Exit(1)
	}

	// Convert the input path to an absolute path
	filePath, err := filepath.Abs(os.Args[1])
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving absolute path: %v\n", err)
		os.Exit(1)
	}

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		fmt.Fprintf(os.Stderr, "File not found: %s\n", filePath)
		os.Exit(1)
	}

	// Extract config
	config, err := extractConfig(filePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error extracting config: %v\n", err)
		os.Exit(1)
	}

	// Send config through IPC
	if err := sendMessage(config); err != nil {
		fmt.Fprintf(os.Stderr, "Error sending message: %v\n", err)
		os.Exit(1)
	}

	fmt.Fprintf(os.Stderr, "Successfully extracted and sent config from %s\n", filePath)
}

func extractConfig(filePath string) (*Config, error) {
	// Parse the Go file
	fset := token.NewFileSet()
	
	// Read the file content
	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("error reading file: %v", err)
	}

	// Parse the file content
	node, err := parser.ParseFile(fset, "", content, parser.ParseComments)
	if err != nil {
		return nil, fmt.Errorf("error parsing file: %v", err)
	}

	var config *Config
	ast.Inspect(node, func(n ast.Node) bool {
		if decl, ok := n.(*ast.GenDecl); ok {
			for _, spec := range decl.Specs {
				if valueSpec, ok := spec.(*ast.ValueSpec); ok {
					for _, ident := range valueSpec.Names {
						if ident.Name == "config" {
							if compLit, ok := valueSpec.Values[0].(*ast.CompositeLit); ok {
								config = &Config{}
								for _, elt := range compLit.Elts {
									if kvExpr, ok := elt.(*ast.KeyValueExpr); ok {
										key := kvExpr.Key.(*ast.Ident).Name
										switch key {
										case "Name":
											config.Name = extractStringValue(kvExpr.Value)
										case "Subscribes":
											config.Subscribes = extractStringSlice(kvExpr.Value)
										case "Emits":
											config.Emits = extractStringSlice(kvExpr.Value)
										case "Input":
											config.Input = nil
										case "Flows":
											config.Flows = extractStringSlice(kvExpr.Value)
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return true
	})

	if config == nil {
		return nil, fmt.Errorf("config variable not found in file")
	}

	return config, nil
}

func extractStringValue(expr ast.Expr) string {
	if lit, ok := expr.(*ast.BasicLit); ok && lit.Kind == token.STRING {
		return lit.Value[1 : len(lit.Value)-1]
	}
	return ""
}

func extractStringSlice(expr ast.Expr) []string {
	if compLit, ok := expr.(*ast.CompositeLit); ok {
		result := make([]string, 0, len(compLit.Elts))
		for _, elt := range compLit.Elts {
			if lit, ok := elt.(*ast.BasicLit); ok && lit.Kind == token.STRING {
				result = append(result, lit.Value[1:len(lit.Value)-1])
			}
		}
		return result
	}
	return nil
}

func sendMessage(message interface{}) error {
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("error serializing message: %v", err)
	}

	fd := os.Getenv("NODE_CHANNEL_FD")
	if fd == "" {
		return fmt.Errorf("NODE_CHANNEL_FD not set")
	}

	fdInt, err := strconv.Atoi(fd)
	if err != nil {
		return fmt.Errorf("invalid FD number: %v", err)
	}

	f := os.NewFile(uintptr(fdInt), "ipc")
	if f == nil {
		return fmt.Errorf("error creating file handle")
	}
	defer f.Close()

	if _, err := f.Write(append(jsonMessage, '\n')); err != nil {
		return fmt.Errorf("error writing to IPC: %v", err)
	}

	return nil
}