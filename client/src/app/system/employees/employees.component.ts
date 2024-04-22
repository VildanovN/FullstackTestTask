import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeStore } from 'src/app/core/store/employee.store';
import { ngbDateType } from '../core/interfaces';
import { Employee } from 'src/app/core/api/models';

export enum SortEnum {
  'Department',
  'FullName',
  'BirthDate',
  'EmployeeDate',
  'Salary',
};

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, OnDestroy {
  constructor(
    private employee: EmployeeStore,
  ) { }

  public filterForm = new FormGroup({
    FullName: new FormControl<string>('', { nonNullable: true }),
    Department: new FormControl<string>('', { nonNullable: true }),
    BirthDate: new FormGroup({
      start: new FormControl<ngbDateType>({ year: 0, month: 0, day: 0 }, { nonNullable: true }),
      end: new FormControl<ngbDateType>({ year: 0, month: 0, day: 0 }, { nonNullable: true }),
    }),
    EmployeeDate: new FormGroup({
      start: new FormControl<ngbDateType>({ year: 0, month: 0, day: 0 }, { nonNullable: true }),
      end: new FormControl<ngbDateType>({ year: 0, month: 0, day: 0 }, { nonNullable: true }),
    }),
    Salary: new FormControl<number>(0, { nonNullable: true }),
  });

  public sortEnum = SortEnum;

  public employees: Array<Employee> = [];

  public employees$ = this.employee.employees$;

  public open$ = new Subject<null>();
  
  public delete$ = new Subject<null>();

  public update$ = new Subject<null>();

  private destroy$ = new Subject<null>();

  private sortBy: SortEnum;

  private isSortDown: boolean = false;

  ngOnInit(): void {
    this.updateList();

    this.update$
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.updateList);

    this.employees$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.filterForm.reset();
        this.employees = res;
      });
  }

  public open(): void {
    this.open$.next(null);
  }

  public delete(id: number): void {
    this.employee.setActiveId(id);
    this.delete$.next(null);
  }
  
  public edit(id: number): void {
    this.employee.setActiveId(id);
    this.open$.next(null);
  }

  public filterEmployees(employees: Array<Employee>): Array<Employee> {
    var res = employees;
    for (var control in this.filterForm.controls) {
      switch (typeof this.filterForm.get(control)?.value) {
        case 'string':
          res = this.filterByString(control, res);
          break;
        case 'number':
          res = this.filterByNumber(control, res);
          break;
        case 'object':
          res = this.filterByDate(control, res);
          break;
      }
    }
    return res.sort(this.compareEmployees.bind(this));
  }

  public setSort(type: SortEnum): void {
    if (this.sortBy === type) {
      this.isSortDown = !this.isSortDown;
    } else {
      this.sortBy = type;
      this.isSortDown = false;
    }
  }

  private updateList(): void {
    this.employee.fetchEmployeeList();
  }

  private filterByString(control: string, employees: Array<Employee>): Array<Employee> {
    if (this.filterForm.get(control) && this.filterForm.get(control)?.value !== '') {
      const value = this.filterForm.get(control)!.value.toString().toLowerCase();
      return employees.filter((e) => this.getValue(e, control as keyof typeof e).toString().toLowerCase().includes(value));
    }
    return employees;
  }

  private filterByNumber(control: string, employees: Array<Employee>): Array<Employee> {
    if (this.filterForm.get(control) && this.filterForm.get(control)?.value !== 0) {
      const value = this.filterForm.get(control)!.value;
      return employees.filter((e) => this.getValue(e, control as keyof typeof e) === value);
    }
    return employees;
  }

  private filterByDate(control: string, employees: Array<Employee>): Array<Employee> {
    if (this.filterForm.get(control)) {
      const dateGroup = this.filterForm.get(control) as FormGroup;
      for (var dateControl in dateGroup.controls) {
        const isSetted = dateGroup.get(dateControl)?.value.year !== 0 ||
          dateGroup.get(dateControl)?.value.month !== 0 ||
          dateGroup.get(dateControl)?.value.day !== 0;
        if (isSetted) {
          const value = new Date(this.convertNgbDateType(dateGroup.get(dateControl)!.value));
          switch (dateControl) {
            case 'start':
              return employees.filter((e) => new Date(this.getValue(e, control as keyof typeof e)) > value);
            case 'end':
              return employees.filter((e) => new Date(this.getValue(e, control as keyof typeof e)) < value);
          }
        }
      }
    }
    return employees;
  }
  
  private convertNgbDateType(date: ngbDateType): string {
    return (new Date(date.year, date.month-1, date.day)).toISOString();
  }

  private getValue<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];
  }

  private compareEmployees(a: Employee, b: Employee): number {
    switch (this.sortBy) {
      case SortEnum.Department:
        if (a.Department === b.Department) return 0;
        if (a.Department > b.Department) return this.isSortDown ? 1 : -1;
        return this.isSortDown ? -1 : 1;
      case SortEnum.FullName:
        if (a.FullName === b.FullName) return 0;
        if (a.FullName > b.FullName) return this.isSortDown ? 1 : -1;
        return this.isSortDown ? -1 : 1;
      case SortEnum.BirthDate:
        if (a.BirthDate === b.BirthDate) return 0;
        if (a.BirthDate > b.BirthDate) return this.isSortDown ? 1 : -1;
        return this.isSortDown ? -1 : 1;
      case SortEnum.EmployeeDate:
        if (a.EmployeeDate === b.EmployeeDate) return 0;
        if (a.EmployeeDate > b.EmployeeDate) return this.isSortDown ? 1 : -1;
        return this.isSortDown ? -1 : 1;
      case SortEnum.Salary:
        if (a.Salary === b.Salary) return 0;
        if (a.Salary > b.Salary) return this.isSortDown ? 1 : -1;
        return this.isSortDown ? -1 : 1;
    }
    return 0;
  }

  ngOnDestroy(): void {
    this.update$.complete();
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
