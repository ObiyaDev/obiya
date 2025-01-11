package main

import (
	"context"
	"log"
)

type Config struct {
	Name       string
	Subscribes []string
	Emits      []string
	Input      interface{}
	Flows      []string
}

var config = Config{
	Name:       "Call OpenAI",
	Subscribes: []string{"call-openai"},
	Emits:      []string{"openai-response"},
	Input:      nil, // No schema validation
	Flows:      []string{"openai"},
}

func Executor(ctx context.Context, args map[string]interface{}, emit func(event map[string]interface{})) error {
	log.Println("[Call Go OpenAI] Received call_ai event", args)

	message, ok := args["message"]
	if !ok {
		log.Println("Message not found in args")
		return nil
	}

	event := map[string]interface{}{
		"type": "openai-response",
		"data": map[string]interface{}{
			"message": message,
		},
	}

	emit(event)
	return nil
}
