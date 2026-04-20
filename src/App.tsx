import { useMemo, useState } from 'react'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { SearchCitySheet } from './components/SearchCitySheet'
import { useGeolocation } from './hooks/useGeolocation'
import { useWeather } from './hooks/useWeather'
import { DetailsPage } from './pages/DetailsPage'
import { ForecastPage } from './pages/ForecastPage'
import { HomePage } from './pages/HomePage'

function App() {
  const geo = useGeolocation()
  const weather = useWeather(geo.position)

  const [sheetOpen, setSheetOpen] = useState(false)

  const statusForPages = useMemo(() => {
    if (weather.status === 'loading') return 'loading'
    if (weather.status === 'error') return 'error'
    if (weather.status === 'success') return 'success'
    return 'idle'
  }, [weather.status])

  const statusLine = useMemo(() => {
    if (geo.status === 'denied') return '定位已拒绝，可手动搜索城市'
    if (geo.status === 'loading') return '正在获取位置…'
    if (geo.status === 'unavailable') return '当前环境不支持定位'
    if (geo.status === 'error') return geo.errorMessage ?? '定位失败'
    if (weather.status === 'error') return weather.errorMessage ?? '天气数据请求失败'
    return '左右滑动查看预报与详细数据'
  }, [geo.status, geo.errorMessage, weather.status, weather.errorMessage])

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-sky-500 via-sky-600 to-blue-800 text-white">
      <header className="sticky top-0 z-40 border-b border-white/15 bg-sky-600/30 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{weather.vm?.cityName ?? '天气'}</div>
            <div className="truncate text-xs text-white/75">{statusLine}</div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {weather.locationMode === 'manual' ? (
              <button
                type="button"
                className="rounded-full border border-white/25 bg-white/15 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm"
                onClick={() => weather.useAutoLocation()}
              >
                用定位
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-full border border-white/25 bg-white/15 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm"
              onClick={() => setSheetOpen(true)}
            >
              搜索城市
            </button>
            <button
              type="button"
              className="rounded-full border border-white/25 bg-white/15 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm"
              onClick={() => weather.refresh()}
            >
              刷新
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md">
        <Swiper
          className="weather-swiper pb-12"
          modules={[Pagination]}
          pagination={{ clickable: true, dynamicBullets: true }}
          spaceBetween={0}
          slidesPerView={1}
          resistanceRatio={0.85}
          threshold={12}
          touchStartPreventDefault={false}
        >
          <SwiperSlide>
            <HomePage status={statusForPages} vm={weather.vm} />
          </SwiperSlide>
          <SwiperSlide>
            <ForecastPage vm={weather.vm} />
          </SwiperSlide>
          <SwiperSlide>
            <DetailsPage vm={weather.vm} />
          </SwiperSlide>
        </Swiper>
      </main>

      <SearchCitySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelect={(c) => weather.setCity(c)}
      />
    </div>
  )
}

export default App
