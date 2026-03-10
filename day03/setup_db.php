<?php
$db = new PDO('sqlite:database.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Create Users table
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)");

// Create Ideas table
$db->exec("CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)");

// Add a default user (username: admin, password: password123)
$password = password_hash('password123', PASSWORD_DEFAULT);
$stmt = $db->prepare("INSERT OR IGNORE INTO users (username, password) VALUES ('admin', ?)");
$stmt->execute([$password]);

echo "Database initialized successfully.\n";
?>
