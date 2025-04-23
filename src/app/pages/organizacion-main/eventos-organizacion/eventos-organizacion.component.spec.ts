import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosOrganizacionComponent } from './eventos-organizacion.component';

describe('EventosOrganizacionComponent', () => {
  let component: EventosOrganizacionComponent;
  let fixture: ComponentFixture<EventosOrganizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosOrganizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventosOrganizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
