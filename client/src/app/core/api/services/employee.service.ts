import { Injectable } from "@angular/core";
import { BaseService } from "./base-service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateEmployee, Employee } from "../models";

@Injectable({
    providedIn: 'root',
})
export class EmployeeService extends BaseService {
    constructor(
        http: HttpClient,
    ) {
        super(http);
    }

    static readonly EmployeePath = '/employee';

    GetEmployeeList(): Observable<Array<Employee>> {
        return this.http.get<Array<Employee>>(this.rootUrl + EmployeeService.EmployeePath, { observe: 'body' });
    }

    CreateNewEmployee(body: CreateEmployee): Observable<Object> {
        const path = this.rootUrl + EmployeeService.EmployeePath + '/create';
        return this.http.post(path, body);
    }

    UpdateEmployee(body: Employee): Observable<Object> {
        const path = this.rootUrl + EmployeeService.EmployeePath + '/update';
        return this.http.post(path, body);
    }

    DeleteEmployee(id: number): Observable<Object> {
        const path = this.rootUrl + EmployeeService.EmployeePath + `/delete/${id}`;
        return this.http.delete(path);
    }
}
