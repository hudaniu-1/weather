import { useMemo, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
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

  return (
    <div className="min-h-[100svh]">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-100">
              {weather.vm?.cityName ?? '天气'}
            </div>
            <div className="text-xs text-slate-400">
              {geo.status === 'denied'
                ? '定位已拒绝，可手动选择城市'
                : geo.status === 'loading'
                  ? '定位中…'
                  : geo.status === 'error'
                    ? geo.errorMessage ?? '定位失败'
                    : weather.status === 'error'
                      ? weather.errorMessage ?? '请求失败'
                      : '左右滑动切换页面'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-100"
              onClick={() => setSheetOpen(true)}
            >
              搜索城市
            </button>
            <button
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-100"
              onClick={() => weather.refresh()}
            >
              刷新
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md">
        <Swiper
          spaceBetween={12}
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
