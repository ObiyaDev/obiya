<?php

$config = [
    "name" => "Call OpenAI",
    "subscribes" => ["call-openai"],
    "emits" => ["openai-response"],
    "input" => null, // No schema validation
    "flows" => ["openai"],
];

function executor($args, $emit, $ctx) {
    $ctx->logger->info('[Call PHP OpenAI] Received call_ai event', $args);

    if (!isset($args['message'])) {
        $ctx->logger->warn('Message not found in args');
        return;
    }

    $emit([
        "type" => "openai-response",
        "data" => ["message" => $args['message']],
    ]);
}
?>
