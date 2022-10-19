import { TestBed } from '@angular/core/testing';

import { SqliteOfficialService } from './sqlite-official.service';

describe('SqliteOfficialService', () => {
  let service: SqliteOfficialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqliteOfficialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
