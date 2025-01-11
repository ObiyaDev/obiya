<?php

function sendMessage($message) {
    // Encode the message as JSON
    $jsonMessage = json_encode($message);
    if ($jsonMessage === false) {
        fwrite(STDERR, "Error encoding JSON: " . json_last_error_msg() . PHP_EOL);
        exit(1);
    }

    // Get the FD for Node IPC
    $fd = getenv('NODE_CHANNEL_FD');
    if ($fd === false) {
        fwrite(STDERR, "NODE_CHANNEL_FD not set" . PHP_EOL);
        exit(1);
    }

    // Write the message to the IPC channel
    $ipcStream = fopen("php://fd/$fd", 'w');
    if ($ipcStream === false) {
        fwrite(STDERR, "Error opening IPC stream" . PHP_EOL);
        exit(1);
    }

    fwrite($ipcStream, $jsonMessage . "\n");
    fclose($ipcStream);
}

function executePhpFile($filePath) {
    // Use PHP's `include` to load the file and capture the `config` variable
    ob_start();
    include $filePath;
    ob_end_clean();

    if (!isset($config)) {
        fwrite(STDERR, "No config variable found in $filePath" . PHP_EOL);
        exit(1);
    }

    if (!is_array($config)) {
        fwrite(STDERR, "Config variable must be an array" . PHP_EOL);
        exit(1);
    }

    return $config;
}

if ($argc < 2) {
    fwrite(STDERR, "Usage: get-config.php <file_path>" . PHP_EOL);
    exit(1);
}

$filePath = $argv[1];

if (!file_exists($filePath)) {
    fwrite(STDERR, "File not found: $filePath" . PHP_EOL);
    exit(1);
}

try {
    $config = executePhpFile($filePath);
    sendMessage($config);
} catch (Exception $e) {
    fwrite(STDERR, "Error: " . $e->getMessage() . PHP_EOL);
    exit(1);
}
