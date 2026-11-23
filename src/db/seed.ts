import type { Database, SqlValue } from 'sql.js';
import { getDataBase, saveDatabase } from './db';

// ID z tabeli strzalki (wstawiane w schema.ts)
const STRZALKA_BRAK = 1;
const STRZALKA_JEDNOKIERUNKOWA = 2;
const STRZALKA_DWUKIERUNKOWA = 3;

function insert(db: Database, sql: string, params: SqlValue[]): number {
    db.run(sql, params);
    return db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
}

// Proste zdjęcie SVG z inicjałami (żeby nie trzeba było wgrywać prawdziwych plików)
function makeSvg(text: string, color: string, fontSize = 52): Uint8Array {
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">` +
        `<rect width="128" height="128" fill="${color}"/>` +
        `<text x="64" y="64" font-family="sans-serif" font-size="${fontSize}" fill="#fff" ` +
        `text-anchor="middle" dominant-baseline="central">${text}</text></svg>`;
    return new TextEncoder().encode(svg);
}

function addPhoto(db: Database, name: string, text: string, color: string, fontSize?: number): number {
    return insert(
        db,
        'INSERT INTO zdjecia (nazwa_zdj, mime, plik) VALUES (?, ?, ?)',
        [name, 'image/svg+xml', makeSvg(text, color, fontSize)],
    );
}

/** Usuwa wszystkie dane użytkownika (słownik strzalki zostaje). */
export function clearData(db: Database): void {
    const tables = ['relacje', 'os_zdj', 'os_grupa', 'notatki', 'osoby', 'zdjecia', 'grupy', 'typy_relacji'];
    for (const t of tables) db.run(`DELETE FROM ${t}`);
    db.run(`DELETE FROM sqlite_sequence WHERE name IN (${tables.map((t) => `'${t}'`).join(',')})`);
}

type PersonSeed = {
    key: string;
    imie: string;
    nazwisko: string;
    start: string | null;
    stop: string | null;
    color: string;
    x: number;
    y: number;
};

const PERSONS: PersonSeed[] = [
    // pokolenie 1
    { key: 'jozef', imie: 'Józef', nazwisko: 'Kowalski', start: '1925-03-14', stop: '1999-11-02', color: '#5b7c99', x: 150, y: 50 },
    { key: 'maria', imie: 'Maria', nazwisko: 'Kowalska', start: '1928-07-21', stop: '2010-01-30', color: '#b5656b', x: 400, y: 50 },
    // pokolenie 2
    { key: 'jan', imie: 'Jan', nazwisko: 'Kowalski', start: '1952-05-09', stop: null, color: '#4f8a6b', x: 150, y: 250 },
    { key: 'anna', imie: 'Anna', nazwisko: 'Kowalska', start: '1954-12-01', stop: null, color: '#a0689f', x: 400, y: 250 },
    { key: 'tomasz', imie: 'Tomasz', nazwisko: 'Wiśniewski', start: '1950', stop: null, color: '#c58a3c', x: 650, y: 250 },
    // pokolenie 3
    { key: 'piotr', imie: 'Piotr', nazwisko: 'Kowalski', start: '1980-02-18', stop: null, color: '#3f6fb0', x: 100, y: 450 },
    { key: 'kasia', imie: 'Katarzyna', nazwisko: 'Kowalska', start: '1982-09-25', stop: null, color: '#c0607f', x: 350, y: 450 },
    // pokolenie 4
    { key: 'zuzia', imie: 'Zuzanna', nazwisko: 'Kowalska', start: '2008-06-12', stop: null, color: '#d28a4a', x: 100, y: 650 },
    { key: 'michal', imie: 'Michał', nazwisko: 'Kowalski', start: '2011-10-03', stop: null, color: '#4c9aa8', x: 350, y: 650 },
];

/**
 * Czyści bazę i wgrywa przykładowe dane.
 * UWAGA: usuwa wszystkie dotychczasowe osoby, notatki, relacje itd.
 */
export async function loadSampleData(): Promise<{ osoby: number; relacje: number }> {
    const db = await getDataBase();

    db.run('BEGIN');
    try {
        clearData(db);

        // --- OSOBY (+ ikony) ---
        const p: Record<string, number> = {};
        for (const s of PERSONS) {
            const initials = s.imie[0] + s.nazwisko[0];
            const iconId = addPhoto(db, `ikona_${s.key}.svg`, initials, s.color);
            p[s.key] = insert(
                db,
                `INSERT INTO osoby (imie, nazwisko, data_start, data_stop, id_zdj, pos_x, pos_y)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [s.imie, s.nazwisko, s.start, s.stop, iconId, s.x, s.y],
            );
        }

        // --- TYPY RELACJI ---
        const tRodzic = insert(db, 'INSERT INTO typy_relacji (nazwa, kolor, id_strzalki) VALUES (?, ?, ?)',
            ['rodzic → dziecko', '#2e7d32', STRZALKA_JEDNOKIERUNKOWA]);
        const tMalzenstwo = insert(db, 'INSERT INTO typy_relacji (nazwa, kolor, id_strzalki) VALUES (?, ?, ?)',
            ['małżeństwo', '#c62828', STRZALKA_DWUKIERUNKOWA]);
        const tZnajomosc = insert(db, 'INSERT INTO typy_relacji (nazwa, kolor, id_strzalki) VALUES (?, ?, ?)',
            ['znajomość', '#757575', STRZALKA_BRAK]);
        const tWspolpraca = insert(db, 'INSERT INTO typy_relacji (nazwa, kolor, id_strzalki) VALUES (?, ?, ?)',
            ['współpraca', '#1565c0', STRZALKA_DWUKIERUNKOWA]);

        // --- GRUPY ---
        const gRodzina = insert(db, 'INSERT INTO grupy (nazwa, opis, kolor) VALUES (?, ?, ?)',
            ['Rodzina Kowalskich', 'Główna linia rodu Kowalskich', '#fde68a']);
        const gSzkola = insert(db, 'INSERT INTO grupy (nazwa, opis, kolor) VALUES (?, ?, ?)',
            ['Szkoła Podstawowa nr 5', 'Klasa 6B i 3A', '#bfdbfe']);
        const gFirma = insert(db, 'INSERT INTO grupy (nazwa, opis, kolor) VALUES (?, ?, ?)',
            ['Kowalski Stolarstwo', 'Rodzinny warsztat założony w 1958 r.', '#bbf7d0']);

        // --- OS_GRUPA ---
        const osGrupa: [string, number, string | null][] = [
            ['jozef', gRodzina, 'Patriarcha'],
            ['maria', gRodzina, 'Matriarchini'],
            ['jan', gRodzina, null],
            ['anna', gRodzina, null],
            ['piotr', gRodzina, null],
            ['kasia', gRodzina, null],
            ['zuzia', gRodzina, null],
            ['michal', gRodzina, null],
            ['zuzia', gSzkola, 'Uczennica 6B'],
            ['michal', gSzkola, 'Uczeń 3A'],
            ['jozef', gFirma, 'Założyciel'],
            ['jan', gFirma, 'Dyrektor'],
            ['piotr', gFirma, 'Stolarz'],
        ];
        for (const [os, g, stanowisko] of osGrupa) {
            insert(db, 'INSERT INTO os_grupa (id_os, id_grupy, stanowisko) VALUES (?, ?, ?)', [p[os], g, stanowisko]);
        }

        // --- RELACJE (osoba-osoba i osoba-grupa) ---
        let relacje = 0;
        const rel = (t1: 'osoba' | 'grupa', id1: number, t2: 'osoba' | 'grupa', id2: number, typ: number) => {
            insert(db, 'INSERT INTO relacje (typ1, id1, typ2, id2, id_typu) VALUES (?, ?, ?, ?, ?)', [t1, id1, t2, id2, typ]);
            relacje++;
        };
        const os = (k: string) => p[k];

        // małżeństwa
        rel('osoba', os('jozef'), 'osoba', os('maria'), tMalzenstwo);
        rel('osoba', os('jan'), 'osoba', os('anna'), tMalzenstwo);
        rel('osoba', os('piotr'), 'osoba', os('kasia'), tMalzenstwo);

        // rodzice → dzieci
        for (const rodzic of ['jozef', 'maria']) rel('osoba', os(rodzic), 'osoba', os('jan'), tRodzic);
        for (const rodzic of ['jan', 'anna']) rel('osoba', os(rodzic), 'osoba', os('piotr'), tRodzic);
        for (const rodzic of ['piotr', 'kasia']) {
            rel('osoba', os(rodzic), 'osoba', os('zuzia'), tRodzic);
            rel('osoba', os(rodzic), 'osoba', os('michal'), tRodzic);
        }

        // znajomość i współpraca (w tym osoba → grupa)
        rel('osoba', os('tomasz'), 'osoba', os('jan'), tZnajomosc);
        rel('osoba', os('tomasz'), 'grupa', gFirma, tWspolpraca);

        // --- NOTATKI ---
        const notatki: [string, string, number][] = [
            ['jozef', 'Założył warsztat stolarski w 1958 roku.', 1],
            ['jozef', 'Walczył w czasie wojny, o czym rzadko opowiadał.', 0],
            ['maria', 'Najlepsza szarlotka w rodzinie, przepis zaginął.', 1],
            ['jan', 'Przejął firmę po ojcu w 1985 roku.', 1],
            ['anna', 'Nauczycielka matematyki przez 35 lat.', 0],
            ['tomasz', 'Przyjaciel Jana ze studiów, wspólnik w firmie.', 0],
            ['piotr', 'Zbudował rodzinną stronę z drzewem genealogicznym.', 1],
            ['zuzia', 'Interesuje się malarstwem.', 0],
        ];
        for (const [k, tresc, pinned] of notatki) {
            insert(db, 'INSERT INTO notatki (tresc, id_os, pinned) VALUES (?, ?, ?)', [tresc, p[k], pinned]);
        }

        // --- GALERIA (os_zdj) ---
        const wesele = addPhoto(db, 'wesele_1951.svg', 'Wesele', '#7c6f9b', 28);
        const warsztat = addPhoto(db, 'warsztat_1962.svg', 'Warsztat', '#8d6e63', 24);
        const wakacje = addPhoto(db, 'wakacje_2015.svg', 'Wakacje', '#26a69a', 24);

        const galeria: [number, string, string, number][] = [
            [wesele, 'jozef', 'Ślub Józefa i Marii', 1],
            [wesele, 'maria', 'Ślub Józefa i Marii', 0],
            [warsztat, 'jozef', 'Pierwszy rok działalności warsztatu', 0],
            [warsztat, 'jan', 'Jan jako chłopiec w warsztacie ojca', 1],
            [wakacje, 'piotr', 'Wakacje nad morzem', 0],
            [wakacje, 'kasia', 'Wakacje nad morzem', 0],
            [wakacje, 'zuzia', 'Wakacje nad morzem', 1],
            [wakacje, 'michal', 'Wakacje nad morzem', 0],
        ];
        for (const [zdj, k, opis, pinned] of galeria) {
            insert(db, 'INSERT INTO os_zdj (id_zdj, id_os, opis_zdj, pinned) VALUES (?, ?, ?, ?)', [zdj, p[k], opis, pinned]);
        }

        db.run('COMMIT');
        await saveDatabase();
        return { osoby: PERSONS.length, relacje };
    } catch (e) {
        db.run('ROLLBACK');
        throw e;
    }
}