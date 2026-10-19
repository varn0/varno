import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSide } from './hooks/useSide'
import { TechLayout } from './components/tech/TechLayout'
import { TechHome } from './components/tech/TechHome'
import { RouteFallback } from './components/shared/RouteFallback'

const CvPage = lazy(() => import('./components/tech/CvPage').then(m => ({ default: m.CvPage })))
const BlogIndex = lazy(() => import('./components/tech/BlogIndex').then(m => ({ default: m.BlogIndex })))
const BlogPost = lazy(() => import('./components/tech/BlogPost').then(m => ({ default: m.BlogPost })))
const ReadingPage = lazy(() => import('./components/tech/ReadingPage').then(m => ({ default: m.ReadingPage })))

function App() {
  useSide()

  return (
    <Routes>
      <Route element={<TechLayout />}>
        <Route index element={<TechHome />} />
        <Route path="cv" element={<CvPage />} />
        <Route path="blog" element={<BlogIndex />} />
        <Route path="blog/:slug" element={<BlogPost />} />
      </Route>
      <Route
        path="reading"
        element={
          <Suspense fallback={<RouteFallback />}>
            <ReadingPage />
          </Suspense>
        }
      />
    </Routes>
  )
}

export default App
