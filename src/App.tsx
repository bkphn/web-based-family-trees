import { useEffect, useState } from 'react'
import { getDataBase } from './db/db'
import './App.css'


export default function App() {
  const [status, setStatus] = useState<string>('Trwa uruchamianiae silnika SQLite...');

  useEffect(() => {
    const init = async() => {
      try {
        const db = await getDataBase();
        console.log('Obiekt bazy:', db);
        setStatus("Baza uruchomiła się prawidłowo");
      } catch (error: unknown) {
        const message = error instanceof Error? error.message: 'Nieznany błąd';
        setStatus(`Błąd uruchamiania bazy: ${message}`);
      }
      
      
    }
    init();

  },[])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Multimedialne Drzewa Genealogiczne</h1>
      <p>Status bazy danych:</p>
      <div style={{
        padding: '1rem',
        borderRadius: '6px',
        backgroundColor: status.includes('Błąd') ? '#ffebee' : '#e8f5e9',
        border: '1px solid #ccc'
      }}>
        <strong>{status}</strong>
      </div>
    </div>
  );
}

