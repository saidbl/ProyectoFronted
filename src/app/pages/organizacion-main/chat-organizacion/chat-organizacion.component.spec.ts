import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatOrganizacionComponent } from './chat-organizacion.component';

describe('ChatOrganizacionComponent', () => {
  let component: ChatOrganizacionComponent;
  let fixture: ComponentFixture<ChatOrganizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatOrganizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatOrganizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
