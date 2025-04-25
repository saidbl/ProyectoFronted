import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipoOrgComponent } from './equipo-org.component';

describe('EquipoOrgComponent', () => {
  let component: EquipoOrgComponent;
  let fixture: ComponentFixture<EquipoOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipoOrgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipoOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
