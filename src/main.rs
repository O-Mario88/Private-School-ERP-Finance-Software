/**
 * MAPLE School Finance ERP
 * Rust Backend Entry Point
 * 
 * This module initializes the SQLite database and provides
 * core backend functions for the desktop application.
 */

use rusqlite::Connection;

mod db;
mod models;
mod services;

/// Initialize SQLite database with schema
pub fn init_database(db_path: &str) -> Result<Connection, rusqlite::Error> {
    let conn = Connection::open(db_path)?;
    
    // Enable foreign keys and WAL mode for offline-first
    conn.execute_batch("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;")?;
    
    // Load and execute schema
    let schema = include_str!("../schema.sql");
    conn.execute_batch(schema)?;
    
    Ok(conn)
}

/// Main application entry point
fn main() {
    println!("MAPLE School Finance ERP - Backend Service");
    
    // Initialize database
    match init_database("maple_erp.db") {
        Ok(_conn) => {
            println!("✓ Database initialized successfully");
        }
        Err(e) => {
            eprintln!("✗ Failed to initialize database: {}", e);
            std::process::exit(1);
        }
    }
}
