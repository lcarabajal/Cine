import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCandybar } from './admin-candybar';

describe('AdminCandybar', () => {
  let component: AdminCandybar;
  let fixture: ComponentFixture<AdminCandybar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCandybar],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCandybar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
