import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerResenas } from './ver-resenas';

describe('VerResenas', () => {
  let component: VerResenas;
  let fixture: ComponentFixture<VerResenas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerResenas],
    }).compileComponents();

    fixture = TestBed.createComponent(VerResenas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
