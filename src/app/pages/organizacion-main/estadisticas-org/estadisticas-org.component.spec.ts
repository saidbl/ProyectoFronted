import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasOrgComponent } from './estadisticas-org.component';

describe('EstadisticasOrgComponent', () => {
  let component: EstadisticasOrgComponent;
  let fixture: ComponentFixture<EstadisticasOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasOrgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticasOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
