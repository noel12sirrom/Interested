interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

export async function getCoordinates(location: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location
      )}&limit=1`
    );
    const data = (await response.json()) as NominatimResponse[];

    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
} 