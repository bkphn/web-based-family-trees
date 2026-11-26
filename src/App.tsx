import AppLayout from './app/AppLayout'
import GraphViewport from './graph/components/GraphViewport'

import { useEffect, useState } from 'react'
import { getDataBase } from './db/db'
import './App.css'

import { getFullTree } from './services/treeService';
import type { TreeData } from './types/tree';

// Sample data
import { loadSampleData } from './db/seed';


export default function App() {
  const [status, setStatus] = useState<string>('Trwa uruchamianiae silnika SQLite...');
  const [tree, setTree] = useState<TreeData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async() => {
      try {
        // loading the database
        const db = await getDataBase();

        if (!isMounted) return;

        console.log("Baza danych: ",db)
        setStatus("Baza uruchomiła się prawidłowo");

        // loading sample data and testing getting tree data
        await loadSampleData();
        const data = await getFullTree();
        console.log('Pobrane dane z bazy:', data);
        setTree(data)
      } catch (error: unknown) {
        console.error("Złapany błąd:", error)
        if (!isMounted) return
        const message = error instanceof Error? error.message: 'Nieznany błąd';
        setStatus(`Błąd uruchamiania bazy: ${message}`);  
      }
      
      
    }
    init();
    return () => {
      isMounted = false;
    }
  },[])

  const showGraphViewport = false /* true – widok grafu | false – wasze menu */

  return (
    <AppLayout>
          {showGraphViewport ? (
        <GraphViewport />
      ) : (
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
      {tree ? (
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem' }}>
          {/* Osoby */}
          <div>
            <h3>Osoby ({tree.persons.length}):</h3>
            <ul>
              {tree.persons.map((person) => (
                <li key = {person.id}>
                  <strong>{person.name} {person.surname}</strong> (ur. {person.birthDate}
                  {person.deathDate ? ` - zm. ${person.deathDate}` : ''})
                </li>
              ))}
            </ul>
          </div>
          {/* Relacje */}
          <div> 
              <h3>Relacje ({tree.relations.length}):</h3>
              <ul>
                {tree.relations.map((relation) => (
                  <li key = {relation.id}>
                    {relation.personAType} #{relation.personAId} &rarr; {relation.personBType} #{relation.personBId} (typ relacji: {relation.typeId})
                  </li>
                ))}
              </ul>
          </div>
          {/* Grupy */}
          <div> 
              <h3>Grupy ({tree.groups.length}):</h3>
              <ul>
                {tree.groups.map((group) => (
                  <li key = {group.id}>
                    {group.id} {group.name} ({group.description}) {group.color}
                  </li>
                ))}
              </ul>
          </div>
        </div>

      ) : (
        <p>Ładowanie danych drzewa...</p>
      )}

    </div>
      )}
    </AppLayout>
  );
}

