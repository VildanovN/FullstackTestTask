import { Injectable, OnDestroy } from "@angular/core";
import { CreateEmployee, Employee } from "../api/models";
import { Subject, takeUntil } from "rxjs";
import { EmployeeService } from "../api/services";


@Injectable({ providedIn: 'root' })
export class EmployeeStore implements OnDestroy {
    constructor(
        private employeeService: EmployeeService,
    ) { }

    public employees$ = new Subject<Array<Employee>>();

    private _activeId: number | null = null;

    private _employees: Array<Employee> = [];

    private destroy$ = new Subject<null>();

    public getActiveEmployee(): Employee | undefined {
        if (!this._activeId) return undefined;
        return this._employees.find((employee) => employee.Id == this._activeId);
    }

    public getActiveId(): number | null {
        return this._activeId;
    }

    public setActiveId(id: number): void {
        this._activeId = id;
    }

    public resetActiveId(): void {
        this._activeId = null;
    }

    public fetchEmployeeList(): void {
        this.employeeService.GetEmployeeList()
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
                this._employees = res;
                this.employees$.next(this._employees);
            });
    }

    public deleteEmployee(id: number) {
        this.employeeService.DeleteEmployee(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                var index = this._employees.map(e => e.Id).indexOf(id);
                this._employees.splice(index, 1);
                this.employees$.next(this._employees);
            });
    }

    public createEmployee(body: CreateEmployee) {
        this.employeeService.CreateNewEmployee(body)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                var id = Math.max(...this._employees.map(e => e.Id)) + 1;
                this._employees.push({
                    Id: id,
                    FullName: body.FullName,
                    Department: body.Department,
                    BirthDate: body.BirthDate,
                    EmployeeDate: body.EmployeeDate,
                    Salary: body.Salary,
                });
                this.employees$.next(this._employees);
            });
    }

    public updateEmployee(body: Employee) {
        this.employeeService.UpdateEmployee(body)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                var index = this._employees.map(e => e.Id).indexOf(body.Id);
                this._employees[index] = body;
                this.employees$.next(this._employees);
            });
    }

    ngOnDestroy(): void {
        this.employees$.complete();
        this.destroy$.next(null);
        this.destroy$.complete();
    }
}
