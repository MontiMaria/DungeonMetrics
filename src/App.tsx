import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ListaDeAventureros from './Personajes'; // Tu tablero principal
import HojaPersonaje from './HojaPersonaje'; // La página nueva

function App() {
  return (
    <BrowserRouter>
      {/* Todo lo que esté AFUERA de <Routes> se va a ver en todas las páginas (como un menú) */}
      <div className='bg-blue-950 min-h-screen'>
        <h1 className='text-center p-8 text-2xl text-white font-bold border-b border-slate-700'>
          DungeonMetrics 🐉
        </h1>
        
        {/* Adentro de <Routes> va lo que cambia según la URL */}
        <Routes>
          {/* Ruta principal: Muestra la lista de la party */}
          <Route path="/" element={<ListaDeAventureros />} />

          {/* Ruta dinámica: Muestra la hoja del personaje específico */}
          <Route path="/personaje/:id" element={<HojaPersonaje />} />
        </Routes>
        
      </div>
    </BrowserRouter>
  )
}

export default App;