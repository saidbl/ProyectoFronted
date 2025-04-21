import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosDeportistaComponent } from './eventos-deportista.component';

describe('EventosDeportistaComponent', () => {
  let component: EventosDeportistaComponent;
  let fixture: ComponentFixture<EventosDeportistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosDeportistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventosDeportistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
