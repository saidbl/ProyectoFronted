import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorEstadisticasComponent } from './instructor-estadisticas.component';

describe('InstructorEstadisticasComponent', () => {
  let component: InstructorEstadisticasComponent;
  let fixture: ComponentFixture<InstructorEstadisticasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorEstadisticasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorEstadisticasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
