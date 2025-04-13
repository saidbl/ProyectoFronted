import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoEquipoComponent } from './evento-equipo.component';

describe('EventoEquipoComponent', () => {
  let component: EventoEquipoComponent;
  let fixture: ComponentFixture<EventoEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoEquipoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventoEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
