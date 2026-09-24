import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogoPeliculas } from './catalogo-peliculas';

describe('CatalogoPeliculas', () => {
  let component: CatalogoPeliculas;
  let fixture: ComponentFixture<CatalogoPeliculas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoPeliculas],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoPeliculas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
