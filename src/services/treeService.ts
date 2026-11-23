import type { TreeData } from '../types/tree'
import type { Person } from '../types/tree'
import type { Relation } from '../types/tree'
import type { Group } from '../types/tree'
import { getDataBase } from '../db/db'
import type { QueryExecResult } from 'sql.js'

export async function getFullTree(): Promise<TreeData> {
    const db = await getDataBase();

    // Persons
    const personsResult = db.exec(`
        SELECT 
            id,
            imie as name,
            nazwisko as surname,
            data_start as birthDate,
            data_stop as deathDate,
            id_zdj as photoId,
            pos_x as posX,
            pos_y as posY
        FROM osoby`)
    let persons = parseSqlData<Person>(personsResult)

    // Relations
    const relationsResult = db.exec(`
        SELECT
            id,
            id_typu as typeId,
            typ1 as personAType,
            id1 as personAId,
            typ2 as personBType,
            id2 as personBId
        FROM relacje`)
    let relations = parseSqlData<Relation>(relationsResult)

    // Groups
    const groupsResult = db.exec(`
        SELECT
            id,
            nazwa as name,
            opis as description,
            kolor as color
        FROM grupy`)
    let groups = parseSqlData<Group>(groupsResult)
    return {persons: persons, relations: relations, groups: groups}
}

function parseSqlData<T = Record<string,any>>(sqlData: QueryExecResult[]): T[] {
    const columns = sqlData[0]?.columns ?? [];
    const rows = sqlData[0]?.values ?? [];

    let data = []
    const columnsLength = columns.length;
    for (const row of rows) {
        const record: Record<string,any> = {};
        for (let i = 0; i < columnsLength; i++) {
            let key = columns[i];
            record[key] = row[i];
        }
        data.push(record)
    }
    return data as T[];
}