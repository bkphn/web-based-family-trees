export const SCHEMA = `
CREATE TABLE IF NOT EXISTS zdjecia (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nazwa_zdj  TEXT NOT NULL,
    mime       TEXT,
    plik       BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS osoby (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    imie       TEXT NOT NULL,
    nazwisko   TEXT,
    data_start TEXT,
    data_stop  TEXT,
    id_zdj     INTEGER REFERENCES zdjecia(id) ON DELETE SET NULL,
    pos_x      REAL DEFAULT 150,
    pos_y      REAL DEFAULT 150
);

CREATE TABLE IF NOT EXISTS notatki (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    tresc   TEXT NOT NULL,
    id_os   INTEGER NOT NULL REFERENCES osoby(id) ON DELETE CASCADE,
    pinned  INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0,1))
);

CREATE TABLE IF NOT EXISTS strzalki (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    nazwa TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS typy_relacji (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nazwa       TEXT,
    kolor       TEXT NOT NULL DEFAULT '#888888',
    id_strzalki INTEGER NOT NULL REFERENCES strzalki(id)
);

CREATE TABLE IF NOT EXISTS grupy (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    nazwa TEXT NOT NULL,
    opis  TEXT,
    kolor TEXT NOT NULL DEFAULT '#cccccc'
);

-- relacja może łączyć osobę z osobą, osobę z grupą itd.
-- dlatego przy każdym końcu jest typ; FK nie da się tu użyć (wskazuje na 2 tabele)
CREATE TABLE IF NOT EXISTS relacje (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    typ1     TEXT NOT NULL CHECK (typ1 IN ('osoba','grupa')),
    id1      INTEGER NOT NULL,
    typ2     TEXT NOT NULL CHECK (typ2 IN ('osoba','grupa')),
    id2      INTEGER NOT NULL,
    id_typu  INTEGER NOT NULL REFERENCES typy_relacji(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS os_grupa (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    id_os       INTEGER NOT NULL REFERENCES osoby(id) ON DELETE CASCADE,
    id_grupy    INTEGER NOT NULL REFERENCES grupy(id) ON DELETE CASCADE,
    stanowisko  TEXT
);

CREATE TABLE IF NOT EXISTS os_zdj (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    id_zdj    INTEGER NOT NULL REFERENCES zdjecia(id) ON DELETE CASCADE,
    id_os     INTEGER NOT NULL REFERENCES osoby(id) ON DELETE CASCADE,
    opis_zdj  TEXT,
    pinned    INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0,1))
);

CREATE INDEX IF NOT EXISTS idx_notatki_os   ON notatki(id_os);
CREATE INDEX IF NOT EXISTS idx_relacje_1    ON relacje(typ1, id1);
CREATE INDEX IF NOT EXISTS idx_relacje_2    ON relacje(typ2, id2);
CREATE INDEX IF NOT EXISTS idx_os_grupa_os  ON os_grupa(id_os);
CREATE INDEX IF NOT EXISTS idx_os_zdj_os    ON os_zdj(id_os);

-- STRZALKI są nieedytowalne: wypełniamy je raz, z poziomu aplikacji nie ma UI do zmian
INSERT OR IGNORE INTO strzalki (id, nazwa) VALUES
    (1, 'brak'),
    (2, 'jednokierunkowa'),
    (3, 'dwukierunkowa');
`;