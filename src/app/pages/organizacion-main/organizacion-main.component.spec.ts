import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizacionMainComponent } from './organizacion-main.component';

describe('OrganizacionMainComponent', () => {
  let component: OrganizacionMainComponent;
  let fixture: ComponentFixture<OrganizacionMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizacionMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizacionMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
