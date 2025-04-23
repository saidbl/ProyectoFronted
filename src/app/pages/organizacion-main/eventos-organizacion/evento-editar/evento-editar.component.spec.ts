import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoEditarComponent } from './evento-editar.component';

describe('EventoEditarComponent', () => {
  let component: EventoEditarComponent;
  let fixture: ComponentFixture<EventoEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoEditarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventoEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
