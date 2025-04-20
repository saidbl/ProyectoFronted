import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposDeportistaComponent } from './equipos-deportista.component';

describe('EquiposDeportistaComponent', () => {
  let component: EquiposDeportistaComponent;
  let fixture: ComponentFixture<EquiposDeportistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquiposDeportistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquiposDeportistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
