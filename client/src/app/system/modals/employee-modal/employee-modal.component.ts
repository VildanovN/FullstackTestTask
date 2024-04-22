import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { ngbDateType } from '../../core/interfaces';
import { EmployeeStore } from 'src/app/core/store/employee.store';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  templateUrl: './employee-modal.component.html',
  imports: [ReactiveFormsModule, NgbDatepickerModule],
  styleUrls: ['./employee-modal.component.scss']
})
export class EmployeeModalComponent implements OnInit, OnDestroy {
  constructor(
    private modalService: NgbModal,
    private employee: EmployeeStore,
  ) { }

  @Input() open$: Subject<null>;
  @ViewChild('modal', { static: false }) modalRef: TemplateRef<HTMLDivElement>;

  public isEdit: boolean = false;

  private destroy$ = new Subject<null>();

  public employeeForm = new FormGroup({
    FullName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-zA-z ]+$/)] }),
    Department: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-zA-z ]+$/)] }),
    BirthDate: new FormControl<ngbDateType>({ year: 0, month: 0, day: 0 }, { nonNullable: true, validators: Validators.required }),
    EmployeeDate: new FormControl<ngbDateType>({ year: 0, month: 0, day: 0 }, { nonNullable: true, validators: Validators.required }),
    Salary: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[0-9]+$/)] }),
  });

  ngOnInit(): void {
    this.open$
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.open.bind(this));
  }

  private open() {
    const activeEmployee = this.employee.getActiveEmployee();
    if (activeEmployee !== undefined) {
      const value = {
        FullName: activeEmployee.FullName,
        Department: activeEmployee.Department,
        BirthDate: this.convetToNgbDateType(activeEmployee.BirthDate.toString()),
        EmployeeDate: this.convetToNgbDateType(activeEmployee.EmployeeDate.toString()),
        Salary: activeEmployee.Salary,
      };

      this.isEdit = true;

      this.employeeForm.patchValue(value);
    }
    const modal = this.modalService.open(this.modalRef, { centered: true });
    modal.result.then(
      () => {},
      () => {
        this.employeeForm.reset();
        this.employee.resetActiveId();
      }
    );
  }

  public close() {
    this.employeeForm.reset();
    this.employee.resetActiveId();
    this.modalService.dismissAll();
  }

  public save() {
    if (this.isEdit) {
      this.update();
    } else {
      this.create();
    }

    this.modalService.dismissAll();
  }

  public create() {
    const body = {
      FullName: this.employeeForm.controls.FullName.value,
      Department: this.employeeForm.controls.Department.value,
      BirthDate: this.convertNgbDateType(this.employeeForm.controls.BirthDate.value),
      EmployeeDate: this.convertNgbDateType(this.employeeForm.controls.EmployeeDate.value),
      Salary: this.employeeForm.controls.Salary.value
    };

    this.employee.createEmployee(body);
  }

  public update() {
    const activeId = this.employee.getActiveId();

    if (!activeId) return;

    const body = {
      Id: activeId,
      FullName: this.employeeForm.controls.FullName.value,
      Department: this.employeeForm.controls.Department.value,
      BirthDate: this.convertNgbDateType(this.employeeForm.controls.BirthDate.value),
      EmployeeDate: this.convertNgbDateType(this.employeeForm.controls.EmployeeDate.value),
      Salary: this.employeeForm.controls.Salary.value
    };

    this.employee.updateEmployee(body);
  }

  private convertNgbDateType(date: ngbDateType): string {
    return (new Date(date.year, date.month-1, date.day)).toISOString();
  }

  private convetToNgbDateType(date: string): ngbDateType {
    return {
      year: new Date(date).getFullYear(),
      month: new Date(date).getMonth() + 1,
      day: new Date(date).getDay() + 1,
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
