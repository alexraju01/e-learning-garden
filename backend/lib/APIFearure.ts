import { FindAndCountOptions, Model, Order } from 'sequelize';

export interface QueryString {
  sort?: string;
  fields?: string;
  [key: string]: any; // Allows for any other filter properties
}

class APIFeatures<TModel extends Model> {
  public options: FindAndCountOptions = {};
  public query!: Promise<{ count: number; rows: TModel[] }>;

  private queryString: QueryString;
  private model: any;

  constructor(model: any, queryString: QueryString) {
    this.model = model;
    this.queryString = queryString;
  }

  public filter(): APIFeatures<TModel> {
    const queryObject = { ...this.queryString };
    ['page', 'sort', 'limit', 'fields'].forEach((f) => delete queryObject[f]);

    this.options.where = queryObject;
    return this;
  }

  public sort(): APIFeatures<TModel> {
    if (this.queryString.sort) {
      this.options.order = this.queryString.sort
        .split(',')
        .map((field) => (field.startsWith('-') ? [field.substring(1), 'DESC'] : [field, 'ASC']));
    } else {
      // Dedault sort
      this.options.order = [['dueBy', 'ASC']];
    }
    return this;
  }

  // Runs the query with options specified before
  public exec() {
    this.query = this.model.findAndCountAll(this.options);
    return this;
  }
}

export default APIFeatures;
