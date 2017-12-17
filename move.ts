export default class Move {
    public moveAction: string;
    public popularity: string[] = [];
    public threshold: number = 0.5;

    public constructor(action: string) { this.moveAction = action; }
}