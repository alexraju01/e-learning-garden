import { FindAndCountOptions, Model } from 'sequelize';

export interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any; // Allows for any other filter properties
}

class APIFeatures<TModel extends Model> {
  public query!: Promise<{ count: number; rows: TModel[] }>;
  // The query options built throughout the class methods
  private options: FindAndCountOptions = {};
  // The raw query string object from the request
  private queryString: QueryString;
  // The static Model class (e.g., Blog)
  private model: new () => TModel;

  constructor(model: new () => TModel, queryString: QueryString) {
    this.model = model;
    this.queryString = queryString;
  }

  public filter(): APIFeatures<TModel> {
    const queryObject: QueryString = { ...this.queryString };

    // 1. Exclusion: Remove special fields from the filter object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((element) => delete queryObject[element]);

    // 2. Simple Filtering: Assign remaining properties to the 'where' clause
    this.options.where = queryObject;

    // 3. Execute the query using the Model's findAndCountAll method
    this.query = (this.model as any).findAndCountAll(this.options);

    return this;
  }
}

export default APIFeatures;
