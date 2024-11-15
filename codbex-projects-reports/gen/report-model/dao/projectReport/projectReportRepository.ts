import { Query, NamedQueryParameter } from "sdk/db";

export interface projectReport {
    readonly 'Project': string;
}

export interface projectReportFilter {
    readonly 'PROJECT_NAME?': string;
}

export interface projectReportPaginatedFilter extends projectReportFilter {
    readonly "$limit"?: number;
    readonly "$offset"?: number;
}

export class projectReportRepository {

    private readonly datasourceName?: string;

    constructor(datasourceName?: string) {
        this.datasourceName = datasourceName;
    }

    public findAll(filter: projectReportPaginatedFilter): projectReport[] {
        const sql = `
            SELECT codbexProject.PROJECT_NAME as "Project"
            FROM CODBEX_PROJECT as codbexProject
            WHERE codbexProject.PROJECT_NAME LIKE :PROJECT_NAME
            ORDER BY PROJECT_NAME ASC
            ${Number.isInteger(filter.$limit) ? ` LIMIT ${filter.$limit}` : ''}
            ${Number.isInteger(filter.$offset) ? ` OFFSET ${filter.$offset}` : ''}
        `;

        const parameters: NamedQueryParameter[] = [];
        parameters.push({
            name: `PROJECT_NAME`,
            type: `VARCHAR`,
            value: filter['PROJECT_NAME'] !== undefined ?  `%${filter['PROJECT_NAME']}%` : `%`
        });

        return Query.executeNamed(sql, parameters, this.datasourceName);
    }

    public count(filter: projectReportFilter): number {
        const sql = `
            SELECT COUNT(*) as REPORT_COUNT FROM (
                SELECT codbexProject.PROJECT_NAME as "Project"
                FROM CODBEX_PROJECT as codbexProject
                WHERE codbexProject.PROJECT_NAME LIKE :PROJECT_NAME
                ORDER BY PROJECT_NAME ASC
            )
        `;

        const parameters: NamedQueryParameter[] = [];
        parameters.push({
            name: `PROJECT_NAME`,
            type: `VARCHAR`,
            value: filter.PROJECT_NAME !== undefined ?  `%${filter.PROJECT_NAME}%` : `%`
        });

        return Query.executeNamed(sql, parameters, this.datasourceName)[0].REPORT_COUNT;
    }

}