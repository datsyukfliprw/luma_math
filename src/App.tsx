import Sidebar from './components/layout/Sidebar'
import LessonScreen from './screens/LessonScreen'

function App() {
  return (
    <main className="min-h-screen bg-[#faf9f4] p-0 text-[#073B5A] lg:p-5">
      <div className="mx-auto flex min-h-screen max-w-[1500px] gap-6">
        <Sidebar />
        <LessonScreen />
      </div>
    </main>
  )
}

export default App
