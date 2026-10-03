import { Routes, Route } from 'react-router-dom'
import { useSide } from './hooks/useSide'
import { TechLayout } from './components/tech/TechLayout'
import { TechHome } from './components/tech/TechHome'
import { CvPage } from './components/tech/CvPage'
import { BlogIndex } from './components/tech/BlogIndex'
import { BlogPost } from './components/tech/BlogPost'
import { ReadingPage } from './components/tech/ReadingPage'

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
      <Route path="reading" element={<ReadingPage />} />
    </Routes>
  )
}

export default App
