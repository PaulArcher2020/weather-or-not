const DEFAULT_DAYS = 1;

function average(values = []) {
  if (!values.length) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function max(values = []) {
  if (!values.length) {
    return null;
  }

  return values.reduce((currentMax, value) => Math.max(currentMax, value), -Infinity);
}

function decideSession({ maxWindKmh, avgWindKmh, maxTempC, rainMm }) {
  const windsurfReady = maxWindKmh >= 28 && maxTempC >= 10 && rainMm < 2.5;
  const wingfoilReady = avgWindKmh >= 16 && maxWindKmh >= 20 && maxTempC >= 8 && rainMm < 3.5;

  if (windsurfReady) {
    return {
      decision: 'Windsurf',
      reason: 'Strong wind with manageable rain. Perfect for powered-up windsurfing.',
    };
  }

  if (wingfoilReady) {
    return {
      decision: 'Wingfoil',
      reason: 'Moderate-to-strong wind and acceptable weather. Great wingfoiling conditions.',
    };
  }

  return {
    decision: 'Stay Home',
    reason: 'Conditions are too light, too wet, or too cold for a worthwhile session.',
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'Elwood Beach';
    const days = Number.parseInt(searchParams.get('days') || DEFAULT_DAYS, 10);

    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      location,
    )}&count=1&language=en&format=json`;

    const geocodeResponse = await fetch(geocodeUrl, { cache: 'no-store' });
    if (!geocodeResponse.ok) {
      return Response.json({ error: 'Unable to look up location.' }, { status: 502 });
    }

    const geocodeData = await geocodeResponse.json();
    const result = geocodeData?.results?.[0];

    if (!result) {
      return Response.json(
        { error: 'No matching sailing location found. Try a nearby town or beach name.' },
        { status: 404 },
      );
    }

    const latitude = result.latitude;
    const longitude = result.longitude;

    const forecastUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&hourly=temperature_2m,precipitation,wind_speed_10m&forecast_days=${Math.max(1, Math.min(days, 3))}`;

    const forecastResponse = await fetch(forecastUrl, { cache: 'no-store' });

    if (!forecastResponse.ok) {
      return Response.json({ error: 'Unable to fetch forecast data.' }, { status: 502 });
    }

    const forecastData = await forecastResponse.json();

    const windSeries = forecastData?.hourly?.wind_speed_10m || [];
    const tempSeries = forecastData?.hourly?.temperature_2m || [];
    const rainSeries = forecastData?.hourly?.precipitation || [];

    const maxWindKmh = max(windSeries);
    const avgWindKmh = average(windSeries);
    const maxTempC = max(tempSeries);
    const rainMm = rainSeries.reduce((sum, value) => sum + value, 0);

    const recommendation = decideSession({
      maxWindKmh,
      avgWindKmh,
      maxTempC,
      rainMm,
    });

    return Response.json({
      location: {
        name: result.name,
        admin1: result.admin1,
        country: result.country,
        latitude,
        longitude,
      },
      windows: {
        days,
      },
      metrics: {
        maxWindKmh: Number(maxWindKmh?.toFixed(1) || 0),
        avgWindKmh: Number(avgWindKmh?.toFixed(1) || 0),
        maxTempC: Number(maxTempC?.toFixed(1) || 0),
        totalRainMm: Number(rainMm?.toFixed(1) || 0),
      },
      recommendation,
      source: 'Open-Meteo forecast and geocoding APIs',
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: 'Forecast service failed unexpectedly. Please try again.' },
      { status: 500 },
    );
  }
}
