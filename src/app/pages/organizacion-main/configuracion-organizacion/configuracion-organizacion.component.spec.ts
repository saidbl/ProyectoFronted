import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionOrganizacionComponent } from './configuracion-organizacion.component';

describe('ConfiguracionOrganizacionComponent', () => {
  let component: ConfiguracionOrganizacionComponent;
  let fixture: ComponentFixture<ConfiguracionOrganizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionOrganizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionOrganizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
