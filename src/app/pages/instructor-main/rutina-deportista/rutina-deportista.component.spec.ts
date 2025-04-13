import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutinaDeportistaComponent } from './rutina-deportista.component';

describe('RutinaDeportistaComponent', () => {
  let component: RutinaDeportistaComponent;
  let fixture: ComponentFixture<RutinaDeportistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutinaDeportistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RutinaDeportistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
