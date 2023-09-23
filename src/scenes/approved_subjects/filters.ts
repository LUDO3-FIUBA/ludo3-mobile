abstract class Filter {
  type: string;
  value;

  title: string;

  constructor(type: string, value: string, title: string) {
    this.type = type;
    this.value = value;
    this.title = title;
  }

  id(): string {
    return `${this.type}-${this.value}`;
  }
}

export class YearFilter extends Filter {
  constructor(year: string) {
    super('year', year, 'Año');
  }
}

export class NameFilter extends Filter {
  constructor(name: string) {
    super('subject', name, 'Nombre');
  }
}

export class CorrelativeFilter extends Filter {
  constructor(subjectCode: string) {
    super('correlative', subjectCode, 'Correlativas de');
  }
}
