/**
 * Database Module
 * Low-level database operations and connection management
 */

use rusqlite::{Connection, Result as SqliteResult, params};
use crate::models;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(path: &str) -> SqliteResult<Self> {
        let conn = Connection::open(path)?;
        conn.execute_batch("PRAGMA foreign_keys = ON;")?;
        Ok(Database { conn })
    }

    /// Create a new event in the event log
    pub fn create_event(&self, event: &models::FinancialEvent) -> SqliteResult<()> {
        self.conn.execute(
            "INSERT INTO events (id, event_type, aggregate_id, aggregate_version, timestamp, user_id, device_id, data, sync_status) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                &event.id,
                &event.event_type,
                &event.aggregate_id,
                &event.aggregate_version,
                &event.timestamp,
                &event.user_id,
                &event.device_id,
                &event.data,
                &event.sync_status,
            ],
        )?;
        Ok(())
    }

    /// Retrieve all unsynced events
    pub fn get_pending_events(&self) -> SqliteResult<Vec<models::FinancialEvent>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, event_type, aggregate_id, aggregate_version, timestamp, user_id, device_id, data, sync_status 
             FROM events WHERE sync_status IN ('local', 'pending') ORDER BY timestamp ASC"
        )?;

        let events = stmt.query_map([], |row| {
            Ok(models::FinancialEvent {
                id: row.get(0)?,
                event_type: row.get(1)?,
                aggregate_id: row.get(2)?,
                aggregate_version: row.get(3)?,
                timestamp: row.get(4)?,
                user_id: row.get(5)?,
                device_id: row.get(6)?,
                data: row.get::<_, String>(7)?.parse().unwrap_or_default(),
                sync_status: row.get(8)?,
            })
        })?;

        let mut result = Vec::new();
        for event in events {
            result.push(event?);
        }
        Ok(result)
    }

    /// Mark events as synced
    pub fn mark_events_synced(&self, event_ids: &[String]) -> SqliteResult<()> {
        for id in event_ids {
            self.conn.execute(
                "UPDATE events SET sync_status = 'synced', synced_at = CURRENT_TIMESTAMP WHERE id = ?1",
                params![id],
            )?;
        }
        Ok(())
    }
}
