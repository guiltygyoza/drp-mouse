import { DRP, SemanticsType, Vertex, ResolveConflictsType, ActionType } from "@ts-drp/object";

export class CursorDRP implements DRP {
    operations: string[] = ["updateCursor"];
    semanticsType: SemanticsType = SemanticsType.pair;
    positions: Map<string, { x: number; y: number }>;

    constructor() {
        this.positions = new Map<string, { x: number; y: number }>();
    }

    updateCursor(userId: string, position: { x: number; y: number }): void {
        this._updateCursor(userId, position);
    }

    private _updateCursor(userId: string, position: { x: number; y: number }): void {
        this.positions.set(userId, position);
    }

    getCursorPosition(userId: string): { x: number; y: number } | undefined {
        return this.positions.get(userId);
    }

    getUsers(): string[] {
        return [...this.positions.keys()];
    }

	resolveConflicts(vertices: Vertex[]): ResolveConflictsType {
		return { action: ActionType.Nop };
	}
}

export function createCursorDRP(): CursorDRP {
    return new CursorDRP();
}