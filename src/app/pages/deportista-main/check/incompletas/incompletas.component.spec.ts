import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncompletasComponent } from './incompletas.component';

describe('IncompletasComponent', () => {
  let component: IncompletasComponent;
  let fixture: ComponentFixture<IncompletasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncompletasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncompletasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
