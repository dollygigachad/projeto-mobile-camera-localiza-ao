import { db } from "../db";

export type AlbumType = {
  id?: number;
  name: string;
  color?: string;
  created_at?: string;
};

export default class RepositorioAlbum {
  public create(album: AlbumType) {
    const stmt = db.prepareSync(`
      INSERT INTO albums (name, color, created_at)
      VALUES ($name, $color, $created_at)
    `);

    try {
      return stmt.executeSync({
        $name: album.name,
        $color: album.color || "#3b82f6",
        $created_at: new Date().toISOString(),
      });
    } finally {
      stmt.finalizeSync();
    }
  }

  public getAll() {
    return db.getAllSync<{
      id: number;
      name: string;
      color: string;
      created_at: string;
    }>(`
      SELECT id, name, color, created_at
      FROM albums
      ORDER BY created_at DESC
    `);
  }

  public delete(id: number) {
    const stmt = db.prepareSync(`DELETE FROM albums WHERE id = $id`);
    try {
      return stmt.executeSync({ $id: id });
    } finally {
      stmt.finalizeSync();
    }
  }

  public update(id: number, name: string) {
    const stmt = db.prepareSync(`UPDATE albums SET name = $name WHERE id = $id`);
    try {
      return stmt.executeSync({ $id: id, $name: name });
    } finally {
      stmt.finalizeSync();
    }
  }

  public addPhoto(photoId: number, albumId: number) {
    const stmt = db.prepareSync(`
      INSERT OR IGNORE INTO photo_albums (photo_id, album_id)
      VALUES ($photo_id, $album_id)
    `);

    try {
      return stmt.executeSync({
        $photo_id: photoId,
        $album_id: albumId,
      });
    } finally {
      stmt.finalizeSync();
    }
  }

  public removePhoto(photoId: number, albumId: number) {
    const stmt = db.prepareSync(`
      DELETE FROM photo_albums
      WHERE photo_id = $photo_id AND album_id = $album_id
    `);

    try {
      return stmt.executeSync({
        $photo_id: photoId,
        $album_id: albumId,
      });
    } finally {
      stmt.finalizeSync();
    }
  }

  public getPhotos(albumId: number) {
    return db.getAllSync<{
      id: number;
      title: string;
      image_uri: string;
      latitude: number;
      longitude: number;
      created_at: string;
    }>(`
      SELECT p.id, p.title, p.image_uri, p.latitude, p.longitude, p.created_at
      FROM photos p
      INNER JOIN photo_albums pa ON p.id = pa.photo_id
      WHERE pa.album_id = $album_id
      ORDER BY p.created_at DESC
    `, { $album_id: albumId });
  }

  public getAlbumsForPhoto(photoId: number) {
    return db.getAllSync<{
      id: number;
      name: string;
      color: string;
    }>(`
      SELECT a.id, a.name, a.color
      FROM albums a
      INNER JOIN photo_albums pa ON a.id = pa.album_id
      WHERE pa.photo_id = $photo_id
      ORDER BY a.name
    `, { $photo_id: photoId });
  }
}
