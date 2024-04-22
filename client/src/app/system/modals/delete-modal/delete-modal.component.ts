import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeStore } from 'src/app/core/store/employee.store';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss']
})
export class DeleteModalComponent {
  constructor(
    private modalService: NgbModal,
    private employee: EmployeeStore,
  ) { }

  @Input() open$: Subject<null>;
  @ViewChild('modal', { static: false }) modalRef: TemplateRef<HTMLDivElement>;

  private destroy$ = new Subject<null>();

  ngOnInit(): void {
    this.open$
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.open.bind(this));
  }

  private open() {
    const modal = this.modalService.open(this.modalRef, { centered: true });
    modal.result.then(() => {}, () => this.employee.resetActiveId());
  }

  public close() {
    this.employee.resetActiveId();
    this.modalService.dismissAll();
  }

  public delete() {
    const activeId = this.employee.getActiveId();
    if (activeId) {
      this.employee.deleteEmployee(activeId);
    }
    this.modalService.dismissAll();
  }
}
