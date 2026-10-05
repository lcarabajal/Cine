import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomDatepicker } from './custom-datepicker';

describe('CustomDatepicker', () => {
  let component: CustomDatepicker;
  let fixture: ComponentFixture<CustomDatepicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDatepicker],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomDatepicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
