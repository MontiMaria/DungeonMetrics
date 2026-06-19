//Importamos useState
import { useState } from 'react';
import { useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

// 1. Creamos el "contrato" o molde para nuestros aventureros
export interface Personaje {
  id: number;
  nombre: string;
  raza: string;
  clase: string;
  nivel: number;
  hp_actual: number;
  hp_maximo: number;
  imagen: string;
  armadura: number;
  iniciativa: number;
  velocidad: string;
  atributos?: Record<string, any>;
  onDespedir: () => void;
}

// 2. Definimos qué es exactamente un <TarjetaPersonaje />
const TarjetaPersonaje = ({ id, nombre, raza, clase, nivel, hp_actual, hp_maximo, imagen, onDespedir }: Personaje) => {
  
  const [hpActual, setHpActual] = useState(hp_actual);

  const recibirDanio = async (e: any) => {
    e.stopPropagation();
    const nuevoHp = Math.max(0, hpActual - 10);
    setHpActual(nuevoHp); 

    const { error } = await supabase.from('aventureros').update({ hp_actual: nuevoHp }).eq('id', id);

    if (error) console.error("Error al guardar daño:", error);
  };

  const curarVida = async (e: any) => {
    e.stopPropagation();
    const nuevoHp = Math.min(hp_maximo, hpActual + 10);
    setHpActual(nuevoHp);

    const { error } = await supabase.from('aventureros').update({ hp_actual: nuevoHp }).eq('id', id);

    if (error) console.error("Error al guardar cura:", error);
  };

  const porcentajeHp = Math.round((hpActual / hp_maximo) * 100);

  const navegar = useNavigate();

  return (
    <div onClick={() => navegar(`/personaje/${id}`)} className="bg-slate-900 text-white border border-purple-900 p-4 rounded-xl mb-4 relative cursor-pointer" >
      
      <div className="flex items-center gap-4 mb-4">
        <img src={imagen} alt={nombre} className="w-16 h-16 rounded-full border-2 border-purple-500" />
        <div>
          <h3 className='text-amber-400 font-bold text-lg mb-1'>{nombre}</h3>
          {/* El botón de echar en la esquina superior */}
          <button onClick={(e) => { e.stopPropagation(); onDespedir();}} className="absolute top-2 right-2 text-xl hover:scale-110 transition-transform">
            ❌
          </button>
          <p className='text-sm text-slate-300'>Raza: {raza}</p>
          <p className='text-sm text-slate-300'>Clase: {clase}</p>
          <p className='text-sm text-slate-300'>Nivel: {nivel}</p>  
        </div>
      </div>

      {/* Alerta de Vida */}
      {porcentajeHp <= 20 && hpActual > 0 && <p className="mb-1 text-sm font-bold text-red-500 animate-pulse">¡Peligro! Vida crítica</p>}

      {/* Barra de Vida con estilo RPG */}
      <div className='w-full h-6 bg-gray-700 rounded-md mt-2 relative overflow-hidden'>
        <div className='h-full bg-green-600 transition-all duration-300' style={{ width: `${porcentajeHp}%` }}></div>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold shadow-black drop-shadow-md">
          {hpActual} / {hp_maximo} HP
        </span>
      </div>

      <div className="flex gap-2 mt-3">
        <button 
          onClick={recibirDanio}
          disabled={hpActual === 0}
          className="flex-1 text-white text-sm py-2 rounded-md transition-colors bg-red-800 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {hpActual === 0 ? "Derrotado" : "Daño 🗡️"}
        </button>
        <button 
          onClick={curarVida}
          disabled={hpActual === hp_maximo} 
          className="flex-1 text-white text-sm py-2 rounded-md transition-colors bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          Curar 🧪
        </button>      
      </div>
    </div>
  );
};

// 3. Creamos nuestro componente principal (La vista de la lista)
const ListaDeAventureros = () => {
  const [party, setParty] = useState<Personaje[]>([]);

  async function obtenerPersonajes () {
    const { data, error } = await supabase.from('aventureros').select('*');

    if (data) {
      setParty(data);
    } else if (error) {
      console.error("Error trayendo los datos:", error);
    }
  };

  useEffect (() => {
    obtenerPersonajes();
  }, []);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevoPersonaje, setNuevoPersonaje] = useState({
    nombre: '',
    raza: '',       
    clase: '',      
    hp_actual: 100,  
    hp_maximo: 100,  
    armadura: 10,    
    iniciativa: 0,   
    velocidad: ''    
  });

  const manejarCambio = (e: any) => {
    const { name, value } = e.target;
    
    setNuevoPersonaje((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
      
      ...(name === 'hp_maximo' && { hp_actual: value })
    }));
  };  

  async function enviarPersonaje (e: any) {
    e.preventDefault();

    const personajeCompleto = {
      ...nuevoPersonaje,
      imagen: `https://ui-avatars.com/api/?background=random&name=${nuevoPersonaje.nombre}`,
      atributos: {}
    };

    const { error } = await supabase.from('aventureros').insert([ personajeCompleto ]);
    if(!error){
      obtenerPersonajes();
      setMostrarModal(false);

      setNuevoPersonaje({
        nombre: '',
        raza: '',       
        clase: '',      
        hp_actual: 100,  
        hp_maximo: 100,  
        armadura: 10,    
        iniciativa: 0,   
        velocidad: ''   
      });
    } else {
      console.error("Hubo un error al reclutar:", error);
    }
  }

  async function despedirPersonaje (idDelete: any, nombreDelete: any) {

    const confirmacion = window.confirm(`Estas seguro de eliminar a ${nombreDelete} de la party? Esta acción no se puede deshacer.`);

    if(confirmacion){
      const { error } = await supabase.from('aventureros').delete().eq('id', idDelete)
      if(!error){
        obtenerPersonajes();
      } else {
        console.error("Hubo un error al eliminar: ", error);
      }
    }
  }

  return (
    <div>
      <h2 className='text-center p-4 text-xl text-white border-t border-slate-700'>Party Nº codigoParty</h2>

      <div className="text-center mb-8">
        <button 
          onClick={() => setMostrarModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white py-3 px-6 rounded-lg text-xl shadow-lg"
        >
          + Reclutar Aventurero
        </button>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          {/* LA CAJA DEL FORMULARIO */}
          <div className="bg-slate-800 rounded-xl p-8 w-full max-w-2xl border border-slate-600 shadow-2xl relative">
            
            {/* Botón de cerrar la ventana (X) */}
            <button 
              onClick={() => setMostrarModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>

            <h2 className="text-2xl text-white font-bold mb-6 text-center">Ficha de Reclutamiento</h2>

            <form onSubmit={enviarPersonaje} className="grid grid-cols-2 gap-4">
              {/* ACÁ ADENTRO VAN TUS INPUTS */}
              <div className="col-span-2">
                <label className="text-white">Nombre</label>
                <input type="text" name="nombre" value={nuevoPersonaje.nombre} onChange={manejarCambio} className="w-full p-2 rounded bg-slate-700 text-white" required />
              </div>

              <div>
                <label className="text-white" htmlFor="clase">Clase</label>
                <input type="text" name="clase" value={nuevoPersonaje.clase} onChange={manejarCambio} className="w-full p-2 rounded bg-slate-700 text-white" required />
              </div>

              <div>
                <label className="text-white" htmlFor="raza">Raza</label>
                <input type="text" name="raza" value={nuevoPersonaje.raza} onChange={manejarCambio} className="w-full p-2 rounded bg-slate-700 text-white" required />
              </div>

              <div>
                <label className="text-white" htmlFor="hp_maximo">HP</label>
                <input type='number' id='hp_maximo' name='hp_maximo' value={nuevoPersonaje.hp_maximo} onChange={manejarCambio} className="w-full p-2 rounded bg-slate-700 text-white" required />
              </div>
              
              <div>
                <label className="text-white">Armadura</label>
                <input type="number" name="armadura" value={nuevoPersonaje.armadura} onChange={manejarCambio} className="w-full p-2 rounded bg-slate-700 text-white" required />
              </div>

              <div>
                <label className="text-white">Iniciativa</label>
                <input type="number" name="iniciativa" value={nuevoPersonaje.iniciativa} onChange={manejarCambio} className="w-full p-2 rounded bg-slate-700 text-white" required />
              </div>

              <div>
                <label className="text-white">Velocidad</label>
                <input type="text" name="velocidad" value={nuevoPersonaje.velocidad} onChange={manejarCambio} className="w-full p-2 rounded bg-slate-700 text-white" required />
              </div>

              <button type="submit" className="col-span-2 mt-4 bg-purple-600 text-white p-3 rounded font-bold hover:bg-purple-500">
                Firmar Contrato
              </button>
            </form>
          </div>
        </div>
      )}

      <div className='grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 p-4 pt-8' >

        {/* 3. Abrimos llaves {} para avisarle a React que vamos a escribir JavaScript adentro del HTML */}
        {party.map((p) => (
          <TarjetaPersonaje 
            key={p.id} 
            {...p} // Esto pasa id, nombre, raza, clase, nivel, hp_actual, hp_maximo, imagen, armadura, iniciativa, velocidad, atributos
            onDespedir={() => despedirPersonaje(p.id, p.nombre)} 
          />
        ))}
      </div>
    </div>
    
  );
};

// Esto le dice a React: "Ey, la pieza principal de este archivo es la ListaDeAventureros, dejá que otros la usen"
export default ListaDeAventureros;