import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemComponent } from './system.component';
import { SystemRoutingModule } from './system-routing.module';
import { MainComponent } from './main/main.component';
import { EmployeesComponent } from './employees/employees.component';
import { EmployeeModalComponent } from './modals/employee-modal/employee-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModalComponent } from './modals/delete-modal/delete-modal.component';

const componentList = [
  SystemComponent,
  MainComponent,
  EmployeesComponent,
]

@NgModule({
  declarations: [...componentList],
  imports: [
    CommonModule,
    SystemRoutingModule,
    ReactiveFormsModule,
    EmployeeModalComponent,
    DeleteModalComponent,
    NgbDatepickerModule,
  ]
})
export class SystemModule { }
