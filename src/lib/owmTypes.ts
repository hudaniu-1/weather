export type OwmWeatherCondition = {
  id: number
  main: string
  description: string
  icon: string
}

export type OwmCoord = { lon: number; lat: number }

export type OwmMain = {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  pressure: number
  humidity: number
}

export type OwmWind = {
  speed: number
  deg: number
  gust?: number
}

export type OwmSys = {
  sunrise: number
  sunset: number
}

export type OwmCurrentWeatherResponse = {
  coord: OwmCoord
  weather: OwmWeatherCondition[]
  main: OwmMain
  visibility?: number
  wind: OwmWind
  sys: OwmSys
  dt: number
  timezone: number
  name: string
}

export type OwmForecastItem = {
  dt: number
  main: Pick<
    OwmMain,
    'temp' | 'feels_like' | 'temp_min' | 'temp_max' | 'pressure' | 'humidity'
  >
  weather: OwmWeatherCondition[]
  visibility?: number
  wind: OwmWind
  pop: number
  rain?: { '3h'?: number }
  snow?: { '3h'?: number }
  dt_txt: string
}

export type OwmForecastResponse = {
  list: OwmForecastItem[]
  city: {
    id: number
    name: string
    coord: OwmCoord
    country: string
    timezone: number
    sunrise: number
    sunset: number
  }
}

export type OwmAirPollutionItem = {
  dt: number
  main: { aqi: 1 | 2 | 3 | 4 | 5 }
  components: Record<string, number>
}

export type OwmAirPollutionResponse = {
  coord: OwmCoord
  list: OwmAirPollutionItem[]
}

export type OwmGeoDirectItem = {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
  local_names?: Record<string, string>
}

export type OwmGeoReverseItem = {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
  local_names?: Record<string, string>
}

