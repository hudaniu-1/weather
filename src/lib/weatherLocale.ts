/** 中文天气与单位文案（展示用） */

const WIND_DIR_16 = [
  '北风',
  '北东北风',
  '东北风',
  '东东北风',
  '东风',
  '东东南风',
  '东南风',
  '南东南风',
  '南风',
  '南西南风',
  '西南风',
  '西西南风',
  '西风',
  '西西北风',
  '西北风',
  '北西北风',
]

export function windDirectionCn(deg: number | undefined): string {
  if (deg == null || !Number.isFinite(deg)) return '—'
  const i = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16
  return WIND_DIR_16[i]!
}

/** 蒲福风级近似（由 m/s 换算，仅作展示） */
export function windLevelCn(speedMps: number): string {
  if (!Number.isFinite(speedMps) || speedMps < 0) return '—'
  if (speedMps < 0.3) return '0 级'
  if (speedMps < 1.6) return '1 级'
  if (speedMps < 3.4) return '2 级'
  if (speedMps < 5.5) return '3 级'
  if (speedMps < 8.0) return '4 级'
  if (speedMps < 10.8) return '5 级'
  if (speedMps < 13.9) return '6 级'
  if (speedMps < 17.2) return '7 级'
  return '8 级及以上'
}

/** 露点近似（℃），由气温与相对湿度估算（API 无 dew_point 时使用） */
export function approxDewPointC(tempC: number, rhPct: number): number {
  const rh = Math.min(100, Math.max(1, rhPct))
  const a = 17.27
  const b = 237.7
  const alpha = (a * tempC) / (b + tempC) + Math.log(rh / 100)
  return (b * alpha) / (a - alpha)
}

export function feelsLikeDescriptorCn(actualC: number, feelsC: number): string {
  const d = feelsC - actualC
  if (d > 3) return '体感偏热'
  if (d < -3) return '体感偏凉'
  if (d > 1) return '略偏热'
  if (d < -1) return '略偏凉'
  return '较为舒适'
}

export function visibilityDescriptorCn(km: number): string {
  if (!Number.isFinite(km) || km <= 0) return '—'
  if (km >= 10) return '视野良好'
  if (km >= 4) return '能见度一般'
  if (km >= 1) return '能见度较差'
  return '能见度很低'
}

export function aqiLevelCn(aqi: 1 | 2 | 3 | 4 | 5): string {
  switch (aqi) {
    case 1:
      return '优'
    case 2:
      return '良'
    case 3:
      return '轻度污染'
    case 4:
      return '中度污染'
    case 5:
      return '重度污染'
  }
}

export function aqiAdviceCn(aqi: 1 | 2 | 3 | 4 | 5): string {
  switch (aqi) {
    case 1:
      return '适宜户外运动'
    case 2:
      return '适宜户外活动'
    case 3:
      return '敏感人群减少长时间户外活动'
    case 4:
      return '减少户外运动，外出佩戴口罩'
    case 5:
      return '避免户外运动，外出做好防护'
  }
}

export function twoHourRainSummaryCn(hour1Mm: number, hour2Mm: number): string {
  const total = hour1Mm + hour2Mm
  if (total < 0.05) return '未来 2 小时内无显著降水。'
  return `未来 2 小时预计降水量约 ${total.toFixed(1)} 毫米。`
}
