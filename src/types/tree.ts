export interface Person {
    id: number;
    name: string;
    surname: string;
    birthDate: string;
    deathDate: string | null;
    photoId: number | null;
    posX: number;
    posY: number;
}
export interface Relation {
    id: number;
    typeId: number;

    personAType: 'osoba' | 'grupa';
    personAId: number;

    personBType: 'osoba' | 'grupa';
    personBId: number;
}
export interface Group {
    id: number;
    name: string;
    description: string;
    color: string;
}
export interface TreeData {
    persons: Person[];
    relations: Relation[];
    groups: Group[];
}