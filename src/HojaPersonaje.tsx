import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from './supabase';
import type { Personaje } from './Personajes'; 

export default function HojaPersonaje() {
  const { id } = useParams();
  const [personaje, setPersonaje] = useState<Personaje | null>(null);
  const [cargando, setCargando] = useState(true);

  // --- NUEVOS ESTADOS PARA EL MODAL DE ATRIBUTOS ---
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoAtributo, setNuevoAtributo] = useState({ nombre: '', valor: '' });

  useEffect(() => {
    async function obtenerDatos() {
      setCargando(true);
      const { data, error } = await supabase.from('aventureros').select('*').eq('id', id).single();
      if (error) console.error("Error al traer el personaje:", error);
      else setPersonaje(data);
      setCargando(false);
    }
    obtenerDatos();
  }, [id]);

  // --- NUEVAS FUNCIONES DE JSONB ---
  const guardarAtributo = async (e: any) => {
    e.preventDefault();
    if (!nuevoAtributo.nombre || !nuevoAtributo.valor || !personaje) return;

    // 1. Clonamos el JSON viejo y le sumamos la nueva propiedad
    const atributosActualizados = {
      ...personaje.atributos,
      [nuevoAtributo.nombre]: nuevoAtributo.valor
    };

    // 2. Actualizamos la pantalla al instante
    setPersonaje({ ...personaje, atributos: atributosActualizados });

    // 3. Lo guardamos en la base de datos
    await supabase.from('aventureros').update({ atributos: atributosActualizados }).eq('id', personaje.id);

    // Limpiamos el input por si quiere cargar otro al toque
    setNuevoAtributo({ nombre: '', valor: '' }); 
  };

  const eliminarAtributo = async (claveParaBorrar: string) => {
    if (!personaje) return;
    
    // Clonamos y eliminamos esa propiedad específica
    const atributosActualizados = { ...personaje.atributos };
    delete atributosActualizados[claveParaBorrar];

    setPersonaje({ ...personaje, atributos: atributosActualizados });
    await supabase.from('aventureros').update({ atributos: atributosActualizados }).eq('id', personaje.id);
  };

  const [mostrarModalDados, setMostrarModalDados] = useState(false);

  const [dadoElegido, setDadoElegido] = useState(20);

  const [resultadoDado, setResultadoDado] = useState<number | null>(null);

  const [girando, setGirando] = useState(false);

  const tirarDado = () => { 
    setGirando(true);

    setTimeout(() => {
      const numeroCalculado = Math.floor(Math.random() * dadoElegido) + 1;
      setResultadoDado(numeroCalculado);
      setGirando(false);
    }, 1000);
  };


  if (cargando) return <p className="text-white text-center mt-10">Buscando en los archivos...</p>;
  if (!personaje) return <p className="text-white text-center mt-10">El aventurero no existe.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <Link to="/" className="text-purple-400 hover:text-purple-300 mb-6 inline-block">← Volver al Tablero</Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-900 p-8 rounded-2xl border border-purple-900/50 shadow-2xl relative">
        
        {/* Columna Izquierda: Imagen y Datos */}
        <div className="text-center">
          <img src={personaje.imagen} alt={personaje.nombre} className="w-48 h-48 rounded-full mx-auto border-4 border-purple-500 shadow-lg mb-4"/>
          <h1 className="text-4xl font-bold text-amber-400">{personaje.nombre}</h1>
          <p className="text-xl text-slate-400">{personaje.raza} {personaje.clase}</p>
          <div className="mt-4 bg-slate-800 p-2 rounded-lg">
            <span className="text-slate-500 text-sm">Nivel</span>
            <p className="text-2xl font-bold">{personaje.nivel}</p>
          </div>
        </div>

        {/* Columna Central: Estadísticas de Combate y Vida */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b border-slate-700 pb-2">Combate Rápido</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
              <span className="text-xs text-slate-400 block">Armadura</span>
              <span className="text-3xl font-bold text-blue-400">{personaje.armadura}</span>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
              <span className="text-xs text-slate-400 block">Iniciativa</span>
              <span className="text-3xl font-bold text-green-400">+{personaje.iniciativa}</span>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700 col-span-2">
              <span className="text-xs text-slate-400 block">Velocidad</span>
              <span className="text-xl font-bold">{personaje.velocidad}</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="font-bold">HP</span>
              <span>{personaje.hp_actual} / {personaje.hp_maximo}</span>
            </div>
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-600 transition-all" style={{ width: `${(personaje.hp_actual / personaje.hp_maximo) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: El Gestor del JSONB */}
        <div>
          <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
             <h2 className="text-xl font-bold">Atributos</h2>
             {/* El botón que abre el modal */}
             <button onClick={() => setMostrarModal(true)} className="bg-green-600 hover:bg-green-500 text-white text-sm px-3 py-1 rounded font-bold">
               + Añadir
             </button>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {/* Dibujamos el JSON si tiene cosas, si no, mostramos un mensaje */}
            {personaje.atributos && Object.keys(personaje.atributos).length > 0 ? (
              Object.entries(personaje.atributos).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-slate-800 rounded group">
                  <span className="capitalize text-slate-300 font-bold">{key}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-amber-400 text-lg">{String(value)}</span>
                    {/* Botón de borrado oculto que aparece al pasar el mouse (Tailwind 'group-hover') */}
                    <button onClick={() => eliminarAtributo(key)} className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      ❌
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No hay atributos cargados.</p>
            )}
          </div>
        </div>
        
      </div>
      <div className='p-8'> {/* Boton tirar dados */}
        <button onClick={() => setMostrarModalDados(true)} className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-3 py-3 rounded font-bold">🎲 Tirar Dados</button>
      </div>

      {/* --- EL MODAL DE CARGA DE ATRIBUTOS --- */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-600 shadow-2xl relative">
            <button onClick={() => setMostrarModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold">×</button>
            <h2 className="text-xl text-white font-bold mb-4">Nuevo Atributo</h2>
            
            <form onSubmit={guardarAtributo} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Nombre (Ej: Fuerza, Maná)</label>
                <input type="text" value={nuevoAtributo.nombre} onChange={(e) => setNuevoAtributo({...nuevoAtributo, nombre: e.target.value})} className="w-full p-2 rounded bg-slate-700 text-white mt-1" required />
              </div>
              <div>
                <label className="text-sm text-slate-400">Valor (Ej: 18, +2, 100%)</label>
                <input type="text" value={nuevoAtributo.valor} onChange={(e) => setNuevoAtributo({...nuevoAtributo, valor: e.target.value})} className="w-full p-2 rounded bg-slate-700 text-white mt-1" required />
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded font-bold hover:bg-purple-500">
                Guardar Atributo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EL MODAL DE DADO --- */}
      {mostrarModalDados && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-600 shadow-2xl relative">
            <button onClick={() => setMostrarModalDados(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold">×</button>
            <h2 className="text-xl text-white font-bold mb-4">Elegir Dado</h2>
            <button onClick={() => setDadoElegido(4)} className={dadoElegido === 4 ? "bg-amber-500 text-slate-900 p-2 m-1 rounded font-bold shadow-lg scale-110 transition-transform" : "bg-purple-600 text-white p-2 m-1 rounded font-bold hover:bg-purple-500 transition-transform"}>D4</button>
            <button onClick={() => setDadoElegido(6)} className={dadoElegido === 6 ? "bg-amber-500 text-slate-900 p-2 m-1 rounded font-bold shadow-lg scale-110 transition-transform" : "bg-purple-600 text-white p-2 m-1 rounded font-bold hover:bg-purple-500 transition-transform" }>D6</button>
            <button onClick={() => setDadoElegido(8)} className={dadoElegido === 8 ? "bg-amber-500 text-slate-900 p-2 m-1 rounded font-bold shadow-lg scale-110 transition-transform" : "bg-purple-600 text-white p-2 m-1 rounded font-bold hover:bg-purple-500 transition-transform" }>D8</button>
            <button onClick={() => setDadoElegido(10)} className={dadoElegido === 10 ? "bg-amber-500 text-slate-900 p-2 m-1 rounded font-bold shadow-lg scale-110 transition-transform" : "bg-purple-600 text-white p-2 m-1 rounded font-bold hover:bg-purple-500 transition-transform" }>D10</button>
            <button onClick={() => setDadoElegido(12)} className={dadoElegido === 12 ? "bg-amber-500 text-slate-900 p-2 m-1 rounded font-bold shadow-lg scale-110 transition-transform" : "bg-purple-600 text-white p-2 m-1 rounded font-bold hover:bg-purple-500 transition-transform" }>D12</button>
            <button onClick={() => setDadoElegido(20)} className={dadoElegido === 20 ? "bg-amber-500 text-slate-900 p-2 m-1 rounded font-bold shadow-lg scale-110 transition-transform" : "bg-purple-600 text-white p-2 m-1 rounded font-bold hover:bg-purple-500 transition-transform" }>D20</button>
            <button onClick={() => setDadoElegido(100)} className={dadoElegido === 100 ? "bg-amber-500 text-slate-900 p-2 m-1 rounded font-bold shadow-lg scale-110 transition-transform" : "bg-purple-600 text-white p-2 m-1 rounded font-bold hover:bg-purple-500 transition-transform" }>D100</button>

            <div className='p-4'>
              {girando ? (
                /* 1. Si 'girando' es true, mostramos un texto que diga "Rodando..." o un emoji */
                <p className="text-white text-center">Rodando... 🎲</p>
              ) : resultadoDado ? (
                /* 2. Si NO está girando, pero 'resultadoDado' tiene un número, mostramos el número gigante */
                <p className="text-amber-400 text-6xl text-center font-bold">{resultadoDado}</p>
              ) : (
                /* 3. Si no está girando y el resultado es null, mostramos el texto por defecto */
                <p className="text-slate-500 text-center">Elegí un dado y tirá</p>
              )}
            </div>
            <button onClick={tirarDado} className="w-full bg-purple-600 text-white p-2 rounded font-bold hover:bg-purple-500">Tirar</button>
          </div>
        </div>
      )}
    </div>
  );
}