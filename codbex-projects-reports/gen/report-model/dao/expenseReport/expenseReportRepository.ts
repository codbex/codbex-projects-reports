import { Query, NamedQueryParameter } from "sdk/db";

export interface expenseReport {
    readonly 'Expense name': string;
    readonly 'Description': string;
    readonly 'Amount': number;
    readonly 'Date': Date;
    readonly 'Status': string;
    readonly 'Employee': string;
    readonly 'Project name': string;
    readonly 'Category': string;
}

export interface expenseReportFilter {
}

export interface expenseReportPaginatedFilter extends expenseReportFilter {
    readonly "$limit"?: number;
    readonly "$offset"?: number;
}

export class expenseReportRepository {

    private readonly datasourceName?: string;

    constructor(datasourceName?: string) {
        this.datasourceName = datasourceName;
    }

    public findAll(filter: expenseReportPaginatedFilter): expenseReport[] {
        const sql = `
            SELECT codbexExpense.EXPENSE_NAME as "Expense name", codbexExpense.EXPENSE_DESCRIPTION as "Description", codbexExpense.EXPENSE_AMOUNT as "Amount", codbexExpense.EXPENSE_DATE as "Date", codbexApprovalstatus.APPROVALSTATUS_NAME as "Status", codbexEmployee.EMPLOYEE_FIRSTNAME as "Employee", codbexProject.PROJECT_NAME as "Project name", codbexExpensecategory.EXPENSECATEGORY_NAME as "Category"
            FROM CODBEX_EXPENSE as codbexExpense
              INNER JOIN CODBEX_APPROVALSTATUS codbexApprovalstatus ON codbexExpense.EXPENSE_ID=codbexApprovalstatus.APPROVALSTATUS_ID
              INNER JOIN CODBEX_EMPLOYEE codbexEmployee ON codbexExpense.EXPENSE_ID=codbexEmployee.EMPLOYEE_ID
              INNER JOIN CODBEX_PROJECT codbexProject ON codbexExpense.EXPENSE_ID=codbexProject.PROJECT_ID
              INNER JOIN CODBEX_EXPENSECATEGORY codbexExpensecategory ON codbexExpense.EXPENSE_ID=codbexExpensecategory.EXPENSECATEGORY_ID
            WHERE codbexExpense.EXPENSE_DATE > '2024-01-01'
            ${Number.isInteger(filter.$limit) ? ` LIMIT ${filter.$limit}` : ''}
            ${Number.isInteger(filter.$offset) ? ` OFFSET ${filter.$offset}` : ''}
        `;

        const parameters: NamedQueryParameter[] = [];

        return Query.executeNamed(sql, parameters, this.datasourceName);
    }

    public count(filter: expenseReportFilter): number {
        const sql = `
            SELECT COUNT(*) as REPORT_COUNT FROM (
                SELECT codbexExpense.EXPENSE_NAME as "Expense name", codbexExpense.EXPENSE_DESCRIPTION as "Description", codbexExpense.EXPENSE_AMOUNT as "Amount", codbexExpense.EXPENSE_DATE as "Date", codbexApprovalstatus.APPROVALSTATUS_NAME as "Status", codbexEmployee.EMPLOYEE_FIRSTNAME as "Employee", codbexProject.PROJECT_NAME as "Project name", codbexExpensecategory.EXPENSECATEGORY_NAME as "Category"
                FROM CODBEX_EXPENSE as codbexExpense
                  INNER JOIN CODBEX_APPROVALSTATUS codbexApprovalstatus ON codbexExpense.EXPENSE_ID=codbexApprovalstatus.APPROVALSTATUS_ID
                  INNER JOIN CODBEX_EMPLOYEE codbexEmployee ON codbexExpense.EXPENSE_ID=codbexEmployee.EMPLOYEE_ID
                  INNER JOIN CODBEX_PROJECT codbexProject ON codbexExpense.EXPENSE_ID=codbexProject.PROJECT_ID
                  INNER JOIN CODBEX_EXPENSECATEGORY codbexExpensecategory ON codbexExpense.EXPENSE_ID=codbexExpensecategory.EXPENSECATEGORY_ID
                WHERE codbexExpense.EXPENSE_DATE > '2024-01-01'
            )
        `;

        const parameters: NamedQueryParameter[] = [];

        return Query.executeNamed(sql, parameters, this.datasourceName)[0].REPORT_COUNT;
    }

}