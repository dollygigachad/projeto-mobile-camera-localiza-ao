import { db } from "../db";

export type PhotoType = {
  id?: number;
  title: string;
  image_uri: string;
  latitude: number;
  longitude: number;
  created_at?: string;
};

export default class RepositorioFoto {
  public create(photo: PhotoType) {
    const stmt = db.prepareSync(`
            INSERT INTO photos (
                title,
                image_uri,
                latitude,
                longitude,
                created_at
            )
            VALUES (
                $title,
                $image_uri, 
                $latitude,
                $longitude,
                $created_at
            )
        `);

    try {
      return stmt.executeSync({
        $title: photo.title,
        $image_uri: photo.image_uri,
        $latitude: photo.latitude,
        $longitude: photo.longitude,
        $created_at: new Date().toISOString(),
      });
    } catch (e) {
      throw e;
    } finally {
      stmt.finalizeSync();
    }
  }

  getAll() {
    return db.getAllSync<{
      id: number;
      title: string;
      image_uri: string;
      latitude: number;
      longitude: number;
      created_at: string;
    }>(`
      SELECT id, title, image_uri, latitude, longitude, created_at
      FROM photos
      ORDER BY created_at DESC
    `);
  }

  delete(id: number) {
    const stmt = db.prepareSync(`DELETE FROM photos WHERE id = $id`);
    try {
      return stmt.executeSync({ $id: id });
    } finally {
      stmt.finalizeSync();
    }
  }

  public update(id: number, title: string, latitude: number, longitude: number) {
    const stmt = db.prepareSync(`
      UPDATE photos
      SET title = $title, latitude = $latitude, longitude = $longitude
      WHERE id = $id
    `);

    try {
      return stmt.executeSync({
        $id: id,
        $title: title,
        $latitude: latitude,
        $longitude: longitude,
      });
    } finally {
      stmt.finalizeSync();
    }
  }

  public search(
    query: string = "",
    dateFrom: string | null = null,
    dateTo: string | null = null,
    latitudeRef: number | null = null,
    longitudeRef: number | null = null,
    radiusKm: number = 50,
    albumId: number | null = null
  ) {
    let sql = `SELECT DISTINCT p.id, p.title, p.image_uri, p.latitude, p.longitude, p.created_at FROM photos p`;

    const params: Record<string, any> = {};
    const conditions: string[] = [];

    // Join para filtro de álbum
    if (albumId) {
      sql += ` INNER JOIN photo_albums pa ON p.id = pa.photo_id`;
      conditions.push(`pa.album_id = $album_id`);
      params.$album_id = albumId;
    }

    // Filtro por título
    if (query.trim()) {
      conditions.push(`p.title LIKE $query`);
      params.$query = `%${query}%`;
    }

    // Filtro por data
    if (dateFrom) {
      conditions.push(`p.created_at >= $date_from`);
      params.$date_from = dateFrom;
    }
    if (dateTo) {
      conditions.push(`p.created_at <= $date_to`);
      params.$date_to = dateTo;
    }

    // Filtro por proximidade GPS (Haversine simplificado)
    if (latitudeRef !== null && longitudeRef !== null) {
      // Aproximação simples: 1 grau ≈ 111km
      const latDelta = radiusKm / 111;
      const lonDelta = radiusKm / (111 * Math.cos((latitudeRef * Math.PI) / 180));

      conditions.push(
        `p.latitude BETWEEN $lat_min AND $lat_max AND p.longitude BETWEEN $lon_min AND $lon_max`
      );
      params.$lat_min = latitudeRef - latDelta;
      params.$lat_max = latitudeRef + latDelta;
      params.$lon_min = longitudeRef - lonDelta;
      params.$lon_max = longitudeRef + lonDelta;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY p.created_at DESC`;

    return db.getAllSync<{
      id: number;
      title: string;
      image_uri: string;
      latitude: number;
      longitude: number;
      created_at: string;
    }>(sql, params);
  }
}
