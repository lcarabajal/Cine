import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminActivitylog } from './admin-activitylog';

describe('AdminActivitylog', () => {
  let component: AdminActivitylog;
  let fixture: ComponentFixture<AdminActivitylog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminActivitylog],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminActivitylog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
