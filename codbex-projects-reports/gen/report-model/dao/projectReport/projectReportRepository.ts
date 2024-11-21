import { Query, NamedQueryParameter } from "sdk/db";

export interface projectReport {
    readonly 'Project': string;
    readonly 'Status': string;
    readonly 'TotalBudget': number;
    readonly 'TotalContingencyReserves': number;
    readonly 'TotalExpense': number;
    readonly 'RemainingBudgetWithoutReserves': number;
    readonly 'RemainingBudgetWithReserves': number;
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
            SELECT codbexProject.PROJECT_NAME as "Project", 
                   codbexStatusType.STATUSTYPE_NAME as "Status",
                   COALESCE(B.TotalBudget, 0) as "TotalBudget",
                   COALESCE(B.TotalContingencyReserves, 0) as "TotalContingencyReserves",
                   COALESCE(E.TotalExpense, 0) as "TotalExpense",
                   (COALESCE(B.TotalBudget, 0) - COALESCE(B.TotalContingencyReserves, 0) - COALESCE(E.TotalExpense, 0)) as "RemainingBudgetWithoutReserves",
                   (COALESCE(B.TotalBudget, 0) - COALESCE(E.TotalExpense, 0)) as "RemainingBudgetWithReserves"
            FROM CODBEX_PROJECT as codbexProject
            LEFT JOIN (
                SELECT BUDGET_PROJECT, 
                       SUM(BUDGET_AMOUNT) AS TotalBudget, 
                       SUM(BUDGET_CONTINGENCYRESERVES) AS TotalContingencyReserves
                FROM CODBEX_BUDGET
                GROUP BY BUDGET_PROJECT
            ) B ON B.BUDGET_PROJECT = codbexProject.PROJECT_ID
            LEFT JOIN (
                SELECT EXPENSE_PROJECT, SUM(EXPENSE_AMOUNT) AS TotalExpense
                FROM CODBEX_EXPENSE
                GROUP BY EXPENSE_PROJECT
            ) E ON E.EXPENSE_PROJECT = codbexProject.PROJECT_ID
            LEFT JOIN CODBEX_STATUSTYPE as codbexStatusType
            ON codbexProject.PROJECT_STATUS = codbexStatusType.STATUSTYPE_ID
            WHERE codbexProject.PROJECT_NAME LIKE :PROJECT_NAME
            ORDER BY codbexProject.PROJECT_NAME ASC
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
                SELECT codbexProject.PROJECT_NAME as "Project", 
                       codbexStatusType.STATUSTYPE_NAME as "Status",
                       COALESCE(B.TotalBudget, 0) as "TotalBudget",
                       COALESCE(B.TotalContingencyReserves, 0) as "TotalContingencyReserves",
                       COALESCE(E.TotalExpense, 0) as "TotalExpense",
                       (COALESCE(B.TotalBudget, 0) - COALESCE(B.TotalContingencyReserves, 0) - COALESCE(E.TotalExpense, 0)) as "RemainingBudgetWithoutReserves",
                       (COALESCE(B.TotalBudget, 0) - COALESCE(E.TotalExpense, 0)) as "RemainingBudgetWithReserves"
                FROM CODBEX_PROJECT as codbexProject
                LEFT JOIN (
                    SELECT BUDGET_PROJECT, 
                           SUM(BUDGET_AMOUNT) AS TotalBudget, 
                           SUM(BUDGET_CONTINGENCYRESERVES) AS TotalContingencyReserves
                    FROM CODBEX_BUDGET
                    GROUP BY BUDGET_PROJECT
                ) B ON B.BUDGET_PROJECT = codbexProject.PROJECT_ID
                LEFT JOIN (
                    SELECT EXPENSE_PROJECT, SUM(EXPENSE_AMOUNT) AS TotalExpense
                    FROM CODBEX_EXPENSE
                    GROUP BY EXPENSE_PROJECT
                ) E ON E.EXPENSE_PROJECT = codbexProject.PROJECT_ID
                LEFT JOIN CODBEX_STATUSTYPE as codbexStatusType
                ON codbexProject.PROJECT_STATUS = codbexStatusType.STATUSTYPE_ID
                WHERE codbexProject.PROJECT_NAME LIKE :PROJECT_NAME
                ORDER BY codbexProject.PROJECT_NAME ASC
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