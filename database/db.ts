import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("photo.db");

export function initDatabase() {
  // Melhora concorrência entre leitura e escrita
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image_uri TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#3b82f6',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS photo_albums (
      photo_id INTEGER NOT NULL,
      album_id INTEGER NOT NULL,
      PRIMARY KEY (photo_id, album_id),
      FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at);
    CREATE INDEX IF NOT EXISTS idx_photo_albums_photo_id ON photo_albums(photo_id);
    CREATE INDEX IF NOT EXISTS idx_photo_albums_album_id ON photo_albums(album_id);
  `);
}
