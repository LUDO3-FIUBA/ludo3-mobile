abstract class Filter {
  type: string;
  value;

  title: string;

  constructor(type, value, title) {
    this.type = type;
    this.value = value;
    this.title = title;
  }

  id(): string {
    return `${this.type}-${this.value}`;
  }
}

export class YearFilter extends Filter {
  constructor(year) {
    super('year', year, 'Año');
  }
}

export class NameFilter extends Filter {
  constructor(name) {
    super('subject', name, 'Nombre');
  }
}

export class CorrelativeFilter extends Filter {
  constructor(subjectCode) {
    super('correlative', subjectCode, 'Correlativas de');
  }
}
