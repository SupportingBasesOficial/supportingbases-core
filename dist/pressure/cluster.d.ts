export interface Cluster {
    obligations: any[];
    total_amount: number;
    cluster_start: string;
    cluster_end: string;
}
export declare function clusterPressures(obligations: any[], windowDays?: number): Cluster[];
